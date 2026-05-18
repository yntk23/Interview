import { getSupabase } from '@/lib/supabase'

export const TASK_STATUSES = ['TODO', 'DOING', 'DONE']

const STATUS = {
  TODO: 'TODO',
  DOING: 'DOING',
  DONE: 'DONE',
}

export const EMPTY_TASK_STATS = {
  todo: 0,
  doing: 0,
  done: 0,
  total: 0,
}

export const PAGE_SIZE = 10

export const TASK_FILTERS = [
  { id: 'ALL', label: 'All' },
  { id: 'TODO', label: 'To Do' },
  { id: 'DOING', label: 'Doing' },
  { id: 'DONE', label: 'Done' },
  { id: 'OVERDUE', label: 'Overdue' },
]

const ANALYTICS_SELECT = 'status, deadline, created_at, updated_at'

function normalizeTask(record) {
  return {
    id: record.id,
    user_id: record.user_id,
    title: record.title,
    status: record.status,
    deadline: record.deadline,
    created_at: record.created_at,
    updated_at: record.updated_at ?? null,
  }
}

const TASK_SELECT =
  'id, user_id, title, status, deadline, created_at, updated_at'

export function computeTaskStats(tasks) {
  const stats = { ...EMPTY_TASK_STATS }

  for (const task of tasks ?? []) {
    stats.total += 1
    const status = String(task.status ?? '').toUpperCase()

    if (status === STATUS.TODO) {
      stats.todo += 1
    } else if (status === STATUS.DOING) {
      stats.doing += 1
    } else if (status === STATUS.DONE) {
      stats.done += 1
    }
  }

  return stats
}

export function filterTasks(tasks, filterId) {
  if (filterId === 'ALL') {
    return tasks
  }

  if (filterId === 'OVERDUE') {
    return tasks.filter((task) => isTaskOverdue(task))
  }

  return tasks.filter(
    (task) => String(task.status ?? '').toUpperCase() === filterId,
  )
}

export function applyTaskRealtimeEvent(tasks, payload, userId) {
  const eventType = payload.eventType
  const newRecord = payload.new
  const oldRecord = payload.old

  if (eventType === 'INSERT') {
    if (!newRecord || String(newRecord.user_id) !== String(userId)) {
      return tasks
    }

    const nextTask = normalizeTask(newRecord)
    return [nextTask, ...tasks.filter((task) => task.id !== nextTask.id)]
  }

  if (eventType === 'UPDATE') {
    if (!newRecord || String(newRecord.user_id) !== String(userId)) {
      if (oldRecord?.id) {
        return tasks.filter((task) => task.id !== oldRecord.id)
      }
      return tasks
    }

    const nextTask = normalizeTask(newRecord)
    const exists = tasks.some((task) => task.id === nextTask.id)

    if (!exists) {
      return [nextTask, ...tasks]
    }

    return tasks.map((task) => (task.id === nextTask.id ? nextTask : task))
  }

  if (eventType === 'DELETE') {
    const deletedId = oldRecord?.id
    if (!deletedId) {
      return tasks
    }
    return tasks.filter((task) => task.id !== deletedId)
  }

  return tasks
}

function applyFilterToQuery(query, filterId) {
  if (filterId === STATUS.TODO || filterId === STATUS.DOING || filterId === STATUS.DONE) {
    return query.eq('status', filterId)
  }

  if (filterId === 'OVERDUE') {
    return query
      .lt('deadline', new Date().toISOString())
      .neq('status', STATUS.DONE)
      .not('deadline', 'is', null)
  }

  return query
}

function buildTasksQuery(userId, columns, filterId) {
  let query = getSupabase()
    .from('tasks')
    .select(columns, { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return applyFilterToQuery(query, filterId)
}

export async function fetchTasksPage(
  userId,
  { page = 0, pageSize = PAGE_SIZE, filterId = 'ALL' } = {},
) {
  const from = page * pageSize
  const to = from + pageSize - 1

  let { data, error, count } = await buildTasksQuery(userId, TASK_SELECT, filterId).range(
    from,
    to,
  )

  if (error?.message?.includes('updated_at')) {
    ;({ data, error, count } = await buildTasksQuery(
      userId,
      'id, user_id, title, status, deadline, created_at',
      filterId,
    ).range(from, to))
  }

  if (error) {
    throw error
  }

  return {
    tasks: (data ?? []).map(normalizeTask),
    totalCount: count ?? 0,
  }
}

export async function fetchTasksForExport(userId, filterId = 'ALL') {
  let { data, error } = await buildTasksQuery(userId, TASK_SELECT, filterId)

  if (error?.message?.includes('updated_at')) {
    ;({ data, error } = await buildTasksQuery(
      userId,
      'id, user_id, title, status, deadline, created_at',
      filterId,
    ))
  }

  if (error) {
    throw error
  }

  return (data ?? []).map(normalizeTask)
}

export async function fetchTasksForAnalytics(userId) {
  let { data, error } = await getSupabase()
    .from('tasks')
    .select(ANALYTICS_SELECT)
    .eq('user_id', userId)

  if (error?.message?.includes('updated_at')) {
    ;({ data, error } = await getSupabase()
      .from('tasks')
      .select('status, deadline, created_at')
      .eq('user_id', userId))
  }

  if (error) {
    throw error
  }

  return data ?? []
}

export function getTotalPages(totalCount, pageSize = PAGE_SIZE) {
  if (totalCount === 0) {
    return 1
  }
  return Math.ceil(totalCount / pageSize)
}

export async function fetchTaskStats(userId) {
  const { data, error } = await getSupabase()
    .from('tasks')
    .select('status')
    .eq('user_id', userId)

  if (error) {
    throw error
  }

  return computeTaskStats(data)
}

export async function createTask(userId, { title, status, deadline }) {
  const row = {
    user_id: userId,
    title: title.trim(),
    status,
    deadline: deadline || null,
  }

  let { data, error } = await getSupabase()
    .from('tasks')
    .insert(row)
    .select(TASK_SELECT)
    .single()

  if (error?.message?.includes('updated_at')) {
    ;({ data, error } = await getSupabase()
      .from('tasks')
      .insert(row)
      .select('id, user_id, title, status, deadline, created_at')
      .single())
  }

  if (error) {
    throw error
  }

  return normalizeTask(data)
}

export async function updateTask(userId, taskId, { title, status }) {
  const payload = {
    title: title.trim(),
    status,
    updated_at: new Date().toISOString(),
  }

  let { data, error } = await getSupabase()
    .from('tasks')
    .update(payload)
    .eq('id', taskId)
    .eq('user_id', userId)
    .select(TASK_SELECT)
    .single()

  if (error?.message?.includes('updated_at')) {
    ;({ data, error } = await getSupabase()
      .from('tasks')
      .update({ title: payload.title, status: payload.status })
      .eq('id', taskId)
      .eq('user_id', userId)
      .select('id, user_id, title, status, deadline, created_at')
      .single())
  }

  if (error) {
    throw error
  }

  return normalizeTask(data)
}

export async function deleteTask(userId, taskId) {
  const { error } = await getSupabase()
    .from('tasks')
    .delete()
    .eq('id', taskId)
    .eq('user_id', userId)

  if (error) {
    throw error
  }
}

export function getProgressPercent(stats) {
  if (!stats?.total) {
    return 0
  }

  return Math.round((stats.done / stats.total) * 100)
}

export function isTaskOverdue(task) {
  if (!task?.deadline || task.status === STATUS.DONE) {
    return false
  }

  return new Date() > new Date(task.deadline)
}

export function formatDateTime(value) {
  if (!value) {
    return '—'
  }

  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function toDatetimeLocalValue(isoString) {
  if (!isoString) {
    return ''
  }

  const date = new Date(isoString)
  const pad = (n) => String(n).padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function fromDatetimeLocalValue(localValue) {
  if (!localValue) {
    return null
  }

  return new Date(localValue).toISOString()
}
