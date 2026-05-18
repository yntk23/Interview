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

export const TASK_FILTERS = [
  { id: 'ALL', label: 'ทั้งหมด' },
  { id: 'TODO', label: 'TODO' },
  { id: 'DOING', label: 'DOING' },
  { id: 'DONE', label: 'DONE' },
  { id: 'OVERDUE', label: 'งานที่สายแล้ว' },
]

function normalizeTask(record) {
  return {
    id: record.id,
    user_id: record.user_id,
    title: record.title,
    status: record.status,
    deadline: record.deadline,
    created_at: record.created_at,
  }
}

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

export async function fetchTasks(userId) {
  const { data, error } = await getSupabase()
    .from('tasks')
    .select('id, user_id, title, status, deadline, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data ?? []
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
  const { data, error } = await getSupabase()
    .from('tasks')
    .insert({
      user_id: userId,
      title: title.trim(),
      status,
      deadline: deadline || null,
    })
    .select('id, user_id, title, status, deadline, created_at')
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function updateTask(userId, taskId, { title, status }) {
  const { data, error } = await getSupabase()
    .from('tasks')
    .update({
      title: title.trim(),
      status,
    })
    .eq('id', taskId)
    .eq('user_id', userId)
    .select('id, user_id, title, status, deadline, created_at')
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function deleteTask(userId, taskId) {
  const { error } = await supabase
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
