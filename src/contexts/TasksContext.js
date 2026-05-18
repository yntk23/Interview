'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { getSupabase } from '@/lib/supabase'
import {
  EMPTY_TASK_STATS,
  applyTaskRealtimeEvent,
  computeTaskStats,
  createTask,
  deleteTask,
  fetchTasks,
  updateTask,
} from '@/lib/tasks'

const TasksContext = createContext(null)

export function TasksProvider({ userId, children }) {
  const [tasks, setTasks] = useState([])
  const [stats, setStats] = useState(EMPTY_TASK_STATS)
  const [loading, setLoading] = useState(Boolean(userId))
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState(null)

  const syncFromTasks = useCallback((nextTasks) => {
    setTasks(nextTasks)
    setStats(computeTaskStats(nextTasks))
  }, [])

  const refresh = useCallback(async () => {
    if (!userId) {
      setTasks([])
      setStats(EMPTY_TASK_STATS)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const nextTasks = await fetchTasks(userId)
      syncFromTasks(nextTasks)
    } catch (err) {
      setError(err.message ?? 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }, [userId, syncFromTasks])

  useEffect(() => {
    refresh()
  }, [refresh])

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
        (payload) => {
          setTasks((current) => {
            const nextTasks = applyTaskRealtimeEvent(current, payload, userId)
            setStats(computeTaskStats(nextTasks))
            return nextTasks
          })
        },
      )
      .subscribe()

    return () => {
      getSupabase().removeChannel(channel)
    }
  }, [userId])

  const runAction = useCallback(
    async (action) => {
      setActionLoading(true)
      setError(null)

      try {
        await action()
        await refresh()
      } catch (err) {
        setError(err.message ?? 'Task operation failed')
        throw err
      } finally {
        setActionLoading(false)
      }
    },
    [refresh],
  )

  const addTask = useCallback(
    (payload) => runAction(() => createTask(userId, payload)),
    [runAction, userId],
  )

  const editTask = useCallback(
    (taskId, payload) => runAction(() => updateTask(userId, taskId, payload)),
    [runAction, userId],
  )

  const removeTask = useCallback(
    (taskId) => runAction(() => deleteTask(userId, taskId)),
    [runAction, userId],
  )

  const value = useMemo(
    () => ({
      tasks,
      stats,
      loading,
      actionLoading,
      error,
      refresh,
      addTask,
      editTask,
      removeTask,
    }),
    [
      tasks,
      stats,
      loading,
      actionLoading,
      error,
      refresh,
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
