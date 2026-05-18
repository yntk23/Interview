import { getSupabase } from '@/lib/supabase'
import { normalizePriority } from '@/lib/priority'

export const TASK_STATUSES = ['TODO', 'DOING', 'DONE']
export { TASK_PRIORITIES } from '@/lib/priority'

const STATUS = {
  TODO: 'TODO',
  DOING: 'DOING',
  DONE: 'DONE',
}

export const EMPTY_TASK_STATS = {
  todo: 0,
  doing: 0,
  overdue: 0,
  done: 0,
  remaining: 0,
  total: 0,
}

export const PAGE_SIZE = 10

export const SORTABLE_COLUMNS = {
  title: 'title',
  deadline: 'deadline',
  created: 'created_at',
}

export const TASK_FILTERS = [
  { id: 'ALL', label: 'All' },
  { id: 'TODO', label: 'To Do' },
  { id: 'DOING', label: 'Doing' },
  { id: 'DONE', label: 'Done' },
  { id: 'OVERDUE', label: 'Overdue' },
]

const ANALYTICS_SELECT = 'status, deadline, created_at, updated_at'
const TASK_SELECT =
  'id, user_id, title, status, priority, deadline, created_at, updated_at'
const TASK_SELECT_FALLBACK =
  'id, user_id, title, status, deadline, created_at'

export const DEFAULT_LIST_QUERY = {
  page: 0,
  pageSize: PAGE_SIZE,
  filterId: 'ALL',
  priorityFilter: 'ALL',
  search: '',
  sortColumn: null,
  sortDirection: null,
  chartDeadlineDay: null,
}

function normalizeTask(record) {
  return {
    id: record.id,
    user_id: record.user_id,
    title: record.title,
    status: record.status,
    priority: normalizePriority(record.priority),
    deadline: record.deadline,
    created_at: record.created_at,
    updated_at: record.updated_at ?? null,
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

    if (isTaskOverdue(task)) {
      stats.overdue += 1
    }
  }

  stats.remaining = stats.total - stats.done

  return stats
}

function getDeadlineDayBounds(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number)
  const start = new Date(year, month - 1, day, 0, 0, 0, 0)
  const end = new Date(year, month - 1, day, 23, 59, 59, 999)
  return { start: start.toISOString(), end: end.toISOString() }
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

function applyListOptionsToQuery(query, options = {}) {
  const {
    filterId = 'ALL',
    priorityFilter = 'ALL',
    search = '',
    chartDeadlineDay = null,
  } = options

  let nextQuery = applyFilterToQuery(query, filterId)

  if (priorityFilter && priorityFilter !== 'ALL') {
    nextQuery = nextQuery.eq('priority', priorityFilter)
  }

  const trimmedSearch = search.trim()
  if (trimmedSearch) {
    nextQuery = nextQuery.ilike('title', `%${trimmedSearch}%`)
  }

  if (chartDeadlineDay) {
    const { start, end } = getDeadlineDayBounds(chartDeadlineDay)
    nextQuery = nextQuery
      .gte('deadline', start)
      .lte('deadline', end)
      .not('deadline', 'is', null)
  }

  return nextQuery
}

function applySortToQuery(query, sortColumn, sortDirection) {
  if (sortColumn && sortDirection) {
    return query.order(sortColumn, {
      ascending: sortDirection === 'asc',
      nullsFirst: sortColumn === 'deadline',
    })
  }

  return query.order('created_at', { ascending: false })
}

function buildTasksQuery(userId, columns, options = {}) {
  let query = getSupabase()
    .from('tasks')
    .select(columns, { count: 'exact' })
    .eq('user_id', userId)

  query = applyListOptionsToQuery(query, options)
  query = applySortToQuery(query, options.sortColumn, options.sortDirection)

  return query
}

async function runTaskQuery(userId, columns, options, withRange) {
  const from = options.page * options.pageSize
  const to = from + options.pageSize - 1

  let query = buildTasksQuery(userId, columns, options)
  if (withRange) {
    query = query.range(from, to)
  } else {
    query = query.range(0, 9999)
  }

  let result = await query

  if (result.error?.message?.includes('priority')) {
    query = buildTasksQuery(userId, TASK_SELECT_FALLBACK, options)
    if (withRange) {
      query = query.range(from, to)
    } else {
      query = query.range(0, 9999)
    }
    result = await query
  }

  if (result.error) {
    throw result.error
  }

  return {
    tasks: (result.data ?? []).map(normalizeTask),
    totalCount: withRange ? (result.count ?? 0) : (result.data?.length ?? 0),
  }
}

export async function fetchTasksPage(userId, options = {}) {
  const merged = { ...DEFAULT_LIST_QUERY, ...options }
  return runTaskQuery(userId, TASK_SELECT, merged, true)
}

export async function fetchTasksForExport(userId, options = {}) {
  const merged = { ...DEFAULT_LIST_QUERY, ...options, page: 0, pageSize: 10000 }
  const { tasks } = await runTaskQuery(userId, TASK_SELECT, merged, false)
  return tasks
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

export function getNextSortState(currentColumn, currentDirection, column) {
  if (currentColumn !== column) {
    return { sortColumn: column, sortDirection: 'asc' }
  }
  if (currentDirection === 'asc') {
    return { sortColumn: column, sortDirection: 'desc' }
  }
  return { sortColumn: null, sortDirection: null }
}

export async function fetchTaskStats(userId) {
  const { data, error } = await getSupabase()
    .from('tasks')
    .select('status, deadline')
    .eq('user_id', userId)

  if (error) {
    throw error
  }

  return computeTaskStats(data)
}

export async function createTask(userId, { title, status, deadline, priority }) {
  const row = {
    user_id: userId,
    title: title.trim(),
    status,
    priority: normalizePriority(priority),
    deadline: deadline || null,
  }

  let { data, error } = await getSupabase()
    .from('tasks')
    .insert(row)
    .select(TASK_SELECT)
    .single()

  if (error?.message?.includes('priority') || error?.message?.includes('updated_at')) {
    const fallbackRow = { ...row }
    delete fallbackRow.priority
    ;({ data, error } = await getSupabase()
      .from('tasks')
      .insert(fallbackRow)
      .select(TASK_SELECT_FALLBACK)
      .single())
  }

  if (error) {
    throw error
  }

  return normalizeTask(data)
}

export async function updateTask(userId, taskId, { title, status, priority }) {
  const payload = {
    title: title.trim(),
    status,
    priority: normalizePriority(priority),
    updated_at: new Date().toISOString(),
  }

  let { data, error } = await getSupabase()
    .from('tasks')
    .update(payload)
    .eq('id', taskId)
    .eq('user_id', userId)
    .select(TASK_SELECT)
    .single()

  if (error?.message?.includes('priority') || error?.message?.includes('updated_at')) {
    const fallback = {
      title: payload.title,
      status: payload.status,
    }
    if (!error?.message?.includes('priority')) {
      fallback.updated_at = payload.updated_at
    }
    ;({ data, error } = await getSupabase()
      .from('tasks')
      .update(fallback)
      .eq('id', taskId)
      .eq('user_id', userId)
      .select(TASK_SELECT_FALLBACK)
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

export async function bulkUpdateTaskStatus(userId, taskIds, status) {
  if (!taskIds.length) {
    return
  }

  const payload = {
    status,
    updated_at: new Date().toISOString(),
  }

  let { error } = await getSupabase()
    .from('tasks')
    .update(payload)
    .in('id', taskIds)
    .eq('user_id', userId)

  if (error?.message?.includes('updated_at')) {
    ;({ error } = await getSupabase()
      .from('tasks')
      .update({ status })
      .in('id', taskIds)
      .eq('user_id', userId))
  }

  if (error) {
    throw error
  }
}

export async function bulkDeleteTasks(userId, taskIds) {
  if (!taskIds.length) {
    return
  }

  const { error } = await getSupabase()
    .from('tasks')
    .delete()
    .in('id', taskIds)
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

export function formatChartDayLabel(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
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
