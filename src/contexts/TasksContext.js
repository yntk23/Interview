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
  EMPTY_TASK_STATS,
  PAGE_SIZE,
  createTask,
  deleteTask,
  fetchTaskStats,
  fetchTasksForAnalytics,
  fetchTasksPage,
  getTotalPages,
  updateTask,
} from '@/lib/tasks'

const TasksContext = createContext(null)

export function TasksProvider({ userId, children }) {
  const [tasks, setTasks] = useState([])
  const [analyticsTasks, setAnalyticsTasks] = useState([])
  const [stats, setStats] = useState(EMPTY_TASK_STATS)
  const [activeFilter, setActiveFilterState] = useState('ALL')
  const [currentPage, setCurrentPage] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(Boolean(userId))
  const [pageLoading, setPageLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState(null)

  const activeFilterRef = useRef(activeFilter)
  const currentPageRef = useRef(currentPage)

  useEffect(() => {
    activeFilterRef.current = activeFilter
  }, [activeFilter])

  useEffect(() => {
    currentPageRef.current = currentPage
  }, [currentPage])

  const totalPages = useMemo(
    () => getTotalPages(totalCount, PAGE_SIZE),
    [totalCount],
  )

  const loadPage = useCallback(
    async (page, filterId, { isPageTransition = false } = {}) => {
      if (!userId) {
        setTasks([])
        setAnalyticsTasks([])
        setStats(EMPTY_TASK_STATS)
        setTotalCount(0)
        return
      }

      if (isPageTransition) {
        setPageLoading(true)
      } else {
        setLoading(true)
      }
      setError(null)

      try {
        const [pageResult, nextStats, nextAnalytics] = await Promise.all([
          fetchTasksPage(userId, { page, pageSize: PAGE_SIZE, filterId }),
          fetchTaskStats(userId),
          fetchTasksForAnalytics(userId),
        ])

        let resolvedPage = page
        let resolvedTasks = pageResult.tasks
        let resolvedCount = pageResult.totalCount

        if (
          resolvedTasks.length === 0 &&
          resolvedCount > 0 &&
          page > 0
        ) {
          const previous = await fetchTasksPage(userId, {
            page: page - 1,
            pageSize: PAGE_SIZE,
            filterId,
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
      } catch (err) {
        const message = err.message ?? 'Failed to load tasks'
        setError(message)
        toast.error(message)
      } finally {
        setLoading(false)
        setPageLoading(false)
      }
    },
    [userId],
  )

  const refresh = useCallback(async () => {
    await loadPage(currentPageRef.current, activeFilterRef.current, {
      isPageTransition: true,
    })
  }, [loadPage])

  const refreshRef = useRef(refresh)
  useEffect(() => {
    refreshRef.current = refresh
  }, [refresh])

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }
    setCurrentPage(0)
    loadPage(0, 'ALL')
  }, [userId, loadPage])

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
          refreshRef.current()
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
      loadPage(0, filterId, { isPageTransition: true })
    },
    [loadPage],
  )

  const goToPage = useCallback(
    (page) => {
      const nextPage = Math.max(0, Math.min(page, getTotalPages(totalCount) - 1))
      setCurrentPage(nextPage)
      loadPage(nextPage, activeFilterRef.current, { isPageTransition: true })
    },
    [loadPage, totalCount],
  )

  const goToPreviousPage = useCallback(() => {
    goToPage(currentPageRef.current - 1)
  }, [goToPage])

  const goToNextPage = useCallback(() => {
    goToPage(currentPageRef.current + 1)
  }, [goToPage])

  const runAction = useCallback(
    async (action, successMessage) => {
      setActionLoading(true)
      setError(null)

      try {
        await action()
        await loadPage(currentPageRef.current, activeFilterRef.current, {
          isPageTransition: true,
        })
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
    [loadPage],
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

  const value = useMemo(
    () => ({
      tasks,
      analyticsTasks,
      stats,
      activeFilter,
      currentPage,
      totalCount,
      totalPages,
      pageSize: PAGE_SIZE,
      loading,
      pageLoading,
      actionLoading,
      error,
      refresh,
      setActiveFilter,
      goToPage,
      goToPreviousPage,
      goToNextPage,
      addTask,
      editTask,
      removeTask,
    }),
    [
      tasks,
      analyticsTasks,
      stats,
      activeFilter,
      currentPage,
      totalCount,
      totalPages,
      loading,
      pageLoading,
      actionLoading,
      error,
      refresh,
      setActiveFilter,
      goToPage,
      goToPreviousPage,
      goToNextPage,
      addTask,
      editTask,
      removeTask,
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
