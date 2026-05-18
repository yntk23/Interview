'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { toast } from 'sonner'
import { getSupabase } from '@/lib/supabase'
import {
  DEFAULT_LIST_QUERY,
  EMPTY_TASK_STATS,
  PAGE_SIZE,
  bulkDeleteTasks,
  bulkUpdateTaskStatus,
  createTask,
  deleteTask,
  fetchTaskStats,
  fetchTasksForAnalytics,
  fetchTasksPage,
  getNextSortState,
  getTotalPages,
  updateTask,
} from '@/lib/tasks'

const TasksContext = createContext(null)

function buildQueryParams(overrides = {}) {
  return { ...DEFAULT_LIST_QUERY, ...overrides }
}

export function TasksProvider({ userId, children }) {
  const [tasks, setTasks] = useState([])
  const [analyticsTasks, setAnalyticsTasks] = useState([])
  const [stats, setStats] = useState(EMPTY_TASK_STATS)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(Boolean(userId))
  const [pageLoading, setPageLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedIds, setSelectedIds] = useState(() => new Set())

  const [activeFilter, setActiveFilterState] = useState('ALL')
  const [priorityFilter, setPriorityFilterState] = useState('ALL')
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sortColumn, setSortColumn] = useState(null)
  const [sortDirection, setSortDirection] = useState(null)
  const [chartDeadlineDay, setChartDeadlineDay] = useState(null)

  const queryRef = useRef(buildQueryParams())
  const currentPageRef = useRef(0)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 500)
    return () => clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    queryRef.current = buildQueryParams({
      filterId: activeFilter,
      priorityFilter,
      search: debouncedSearch,
      sortColumn,
      sortDirection,
      chartDeadlineDay,
    })
  }, [
    activeFilter,
    priorityFilter,
    debouncedSearch,
    sortColumn,
    sortDirection,
    chartDeadlineDay,
  ])

  useEffect(() => {
    currentPageRef.current = currentPage
  }, [currentPage])

  const totalPages = useMemo(
    () => getTotalPages(totalCount, PAGE_SIZE),
    [totalCount],
  )

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const loadPage = useCallback(
    async (page, queryOverrides = {}, { isPageTransition = false } = {}) => {
      if (!userId) {
        setTasks([])
        setAnalyticsTasks([])
        setStats(EMPTY_TASK_STATS)
        setTotalCount(0)
        return
      }

      const query = buildQueryParams({
        ...queryRef.current,
        ...queryOverrides,
        page,
      })

      if (isPageTransition) {
        setPageLoading(true)
      } else {
        setLoading(true)
      }
      setError(null)

      try {
        const [pageResult, nextStats, nextAnalytics] = await Promise.all([
          fetchTasksPage(userId, query),
          fetchTaskStats(userId),
          fetchTasksForAnalytics(userId),
        ])

        let resolvedPage = page
        let resolvedTasks = pageResult.tasks
        let resolvedCount = pageResult.totalCount

        if (resolvedTasks.length === 0 && resolvedCount > 0 && page > 0) {
          const previous = await fetchTasksPage(userId, {
            ...query,
            page: page - 1,
          })
          resolvedPage = page - 1
          resolvedTasks = previous.tasks
          resolvedCount = previous.totalCount
        }

        setTasks(resolvedTasks)
        setTotalCount(resolvedCount)
        setCurrentPage(resolvedPage)
        setStats(nextStats)
        setAnalyticsTasks(nextAnalytics)
        clearSelection()
      } catch (err) {
        const message = err.message ?? 'Failed to load tasks'
        setError(message)
        toast.error(message)
      } finally {
        setLoading(false)
        setPageLoading(false)
      }
    },
    [userId, clearSelection],
  )

  const reloadCurrentView = useCallback(
    (isPageTransition = true) => {
      return loadPage(currentPageRef.current, {}, { isPageTransition })
    },
    [loadPage],
  )

  const reloadRef = useRef(reloadCurrentView)
  useEffect(() => {
    reloadRef.current = reloadCurrentView
  }, [reloadCurrentView])

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }
    setCurrentPage(0)
    loadPage(0, buildQueryParams(), { isPageTransition: false })
  }, [userId, loadPage])

  const skipSearchEffect = useRef(true)
  useEffect(() => {
    if (!userId) {
      return
    }
    if (skipSearchEffect.current) {
      skipSearchEffect.current = false
      return
    }
    setCurrentPage(0)
    loadPage(0, {}, { isPageTransition: true })
  }, [debouncedSearch, userId, loadPage])

  useEffect(() => {
    if (!userId) {
      return undefined
    }

    const channel = getSupabase()
      .channel(`tasks:user:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          reloadRef.current(true)
        },
      )
      .subscribe()

    return () => {
      getSupabase().removeChannel(channel)
    }
  }, [userId])

  const setActiveFilter = useCallback(
    (filterId) => {
      setActiveFilterState(filterId)
      setCurrentPage(0)
      clearSelection()
      loadPage(0, { filterId }, { isPageTransition: true })
    },
    [loadPage, clearSelection],
  )

  const setPriorityFilter = useCallback(
    (nextPriority) => {
      setPriorityFilterState(nextPriority)
      setCurrentPage(0)
      clearSelection()
      loadPage(0, { priorityFilter: nextPriority }, { isPageTransition: true })
    },
    [loadPage, clearSelection],
  )

  const toggleSort = useCallback(
    (column) => {
      const next = getNextSortState(sortColumn, sortDirection, column)
      setSortColumn(next.sortColumn)
      setSortDirection(next.sortDirection)
      setCurrentPage(0)
      clearSelection()
      loadPage(
        0,
        {
          sortColumn: next.sortColumn,
          sortDirection: next.sortDirection,
        },
        { isPageTransition: true },
      )
    },
    [sortColumn, sortDirection, loadPage, clearSelection],
  )

  const setChartDayFilter = useCallback(
    (dateKey) => {
      setChartDeadlineDay(dateKey)
      setCurrentPage(0)
      clearSelection()
      loadPage(0, { chartDeadlineDay: dateKey }, { isPageTransition: true })
    },
    [loadPage, clearSelection],
  )

  const clearChartDayFilter = useCallback(() => {
    setChartDeadlineDay(null)
    setCurrentPage(0)
    clearSelection()
    loadPage(0, { chartDeadlineDay: null }, { isPageTransition: true })
  }, [loadPage, clearSelection])

  const goToPage = useCallback(
    (page) => {
      const nextPage = Math.max(0, Math.min(page, getTotalPages(totalCount) - 1))
      setCurrentPage(nextPage)
      clearSelection()
      loadPage(nextPage, {}, { isPageTransition: true })
    },
    [loadPage, totalCount, clearSelection],
  )

  const goToPreviousPage = useCallback(() => {
    goToPage(currentPageRef.current - 1)
  }, [goToPage])

  const goToNextPage = useCallback(() => {
    goToPage(currentPageRef.current + 1)
  }, [goToPage])

  const toggleSelectTask = useCallback((taskId) => {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(taskId)) {
        next.delete(taskId)
      } else {
        next.add(taskId)
      }
      return next
    })
  }, [])

  const toggleSelectAllOnPage = useCallback(() => {
    setSelectedIds((current) => {
      const pageIds = tasks.map((task) => task.id)
      const allSelected = pageIds.length > 0 && pageIds.every((id) => current.has(id))
      if (allSelected) {
        const next = new Set(current)
        pageIds.forEach((id) => next.delete(id))
        return next
      }
      return new Set([...current, ...pageIds])
    })
  }, [tasks])

  const runAction = useCallback(
    async (action, successMessage) => {
      setActionLoading(true)
      setError(null)

      try {
        await action()
        await reloadCurrentView(true)
        if (successMessage) {
          toast.success(successMessage)
        }
      } catch (err) {
        const message = err.message ?? 'Task operation failed'
        setError(message)
        toast.error(message)
        throw err
      } finally {
        setActionLoading(false)
      }
    },
    [reloadCurrentView],
  )

  const addTask = useCallback(
    (payload) =>
      runAction(() => createTask(userId, payload), 'Task added successfully'),
    [runAction, userId],
  )

  const editTask = useCallback(
    (taskId, payload) =>
      runAction(
        () => updateTask(userId, taskId, payload),
        'Task updated successfully',
      ),
    [runAction, userId],
  )

  const removeTask = useCallback(
    (taskId) =>
      runAction(() => deleteTask(userId, taskId), 'Task deleted successfully'),
    [runAction, userId],
  )

  const bulkMarkDone = useCallback(
    (taskIds) =>
      runAction(
        () => bulkUpdateTaskStatus(userId, taskIds, 'DONE'),
        `${taskIds.length} task${taskIds.length === 1 ? '' : 's'} marked as done`,
      ),
    [runAction, userId],
  )

  const bulkRemoveTasks = useCallback(
    (taskIds) =>
      runAction(
        () => bulkDeleteTasks(userId, taskIds),
        `${taskIds.length} task${taskIds.length === 1 ? '' : 's'} deleted`,
      ),
    [runAction, userId],
  )

  const value = useMemo(
    () => ({
      tasks,
      analyticsTasks,
      stats,
      activeFilter,
      priorityFilter,
      searchInput,
      setSearchInput,
      sortColumn,
      sortDirection,
      chartDeadlineDay,
      currentPage,
      totalCount,
      totalPages,
      pageSize: PAGE_SIZE,
      loading,
      pageLoading,
      actionLoading,
      error,
      selectedIds,
      toggleSelectTask,
      toggleSelectAllOnPage,
      clearSelection,
      setActiveFilter,
      setPriorityFilter,
      toggleSort,
      setChartDayFilter,
      clearChartDayFilter,
      goToPage,
      goToPreviousPage,
      goToNextPage,
      addTask,
      editTask,
      removeTask,
      bulkMarkDone,
      bulkRemoveTasks,
      reloadCurrentView,
    }),
    [
      tasks,
      analyticsTasks,
      stats,
      activeFilter,
      priorityFilter,
      searchInput,
      sortColumn,
      sortDirection,
      chartDeadlineDay,
      currentPage,
      totalCount,
      totalPages,
      loading,
      pageLoading,
      actionLoading,
      error,
      selectedIds,
      toggleSelectTask,
      toggleSelectAllOnPage,
      clearSelection,
      setActiveFilter,
      setPriorityFilter,
      toggleSort,
      setChartDayFilter,
      clearChartDayFilter,
      goToPage,
      goToPreviousPage,
      goToNextPage,
      addTask,
      editTask,
      removeTask,
      bulkMarkDone,
      bulkRemoveTasks,
      reloadCurrentView,
    ],
  )

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
}

export function useTasks() {
  const context = useContext(TasksContext)
  if (!context) {
    throw new Error('useTasks must be used within TasksProvider')
  }
  return context
}
