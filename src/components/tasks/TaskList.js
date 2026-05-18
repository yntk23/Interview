'use client'

import { useState } from 'react'
import StatusBadge from '@/components/tasks/StatusBadge'
import TaskDeleteModal from '@/components/tasks/TaskDeleteModal'
import TaskEditModal from '@/components/tasks/TaskEditModal'
import TaskFilterTabs from '@/components/tasks/TaskFilterTabs'
import TaskPagination from '@/components/tasks/TaskPagination'
import { useTasks } from '@/contexts/TasksContext'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { downloadTasksCsv } from '@/lib/exportTasksCsv'
import { fetchTasksForExport, formatDateTime, isTaskOverdue } from '@/lib/tasks'

export default function TaskList() {
  const { userId } = useAuth()
  const {
    tasks,
    loading,
    pageLoading,
    actionLoading,
    activeFilter,
    currentPage,
    totalCount,
    totalPages,
    setActiveFilter,
    goToPage,
    goToPreviousPage,
    goToNextPage,
    editTask,
    removeTask,
  } = useTasks()

  const [editingTask, setEditingTask] = useState(null)
  const [taskToDelete, setTaskToDelete] = useState(null)
  const [exporting, setExporting] = useState(false)

  async function handleSave(payload) {
    if (!editingTask) {
      return
    }
    await editTask(editingTask.id, payload)
  }

  async function handleConfirmDelete() {
    if (!taskToDelete) {
      return
    }
    try {
      await removeTask(taskToDelete.id)
      setTaskToDelete(null)
    } catch {
      // Toast handled in TasksContext
    }
  }

  async function handleExportCsv() {
    setExporting(true)
    try {
      const exportTasks = await fetchTasksForExport(userId, activeFilter)
      downloadTasksCsv(exportTasks)
    } catch (err) {
      toast.error(err.message ?? 'Failed to export tasks')
    } finally {
      setExporting(false)
    }
  }

  const isTableLoading = pageLoading
  const showEmptyAll = !loading && totalCount === 0 && activeFilter === 'ALL'
  const showEmptyFilter = !loading && totalCount === 0 && activeFilter !== 'ALL'

  if (loading && totalCount === 0) {
    return (
      <section className="card-panel">
        <p className="card-panel-muted text-sm">Loading tasks...</p>
      </section>
    )
  }

  return (
    <>
      <section className="card-panel overflow-hidden p-0">
        <header className="border-b border-slate-200 px-4 py-4 sm:px-6">
          <h2 className="text-lg font-semibold text-slate-900">Your tasks</h2>
          <p className="card-panel-muted mt-1 text-sm">
            {totalCount === 0
              ? 'No tasks match this view'
              : `${totalCount} task${totalCount === 1 ? '' : 's'} ${
                  activeFilter === 'ALL' ? 'total' : 'in filter'
                }`}
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <TaskFilterTabs
              activeFilter={activeFilter}
              onChange={setActiveFilter}
              disabled={loading}
            />

            <button
              type="button"
              onClick={handleExportCsv}
              disabled={totalCount === 0 || exporting || actionLoading}
              className="btn-secondary inline-flex shrink-0 items-center justify-center gap-2 shadow-sm"
            >
              <span aria-hidden="true">⬇</span>
              {exporting ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>
        </header>

        {showEmptyAll ? (
          <p className="card-panel-muted px-4 py-10 text-center text-sm sm:px-6">
            No tasks yet. Add your first task above.
          </p>
        ) : showEmptyFilter ? (
          <p className="card-panel-muted px-4 py-10 text-center text-sm sm:px-6">
            No tasks match this filter.
          </p>
        ) : (
          <>
            <div
              className={`overflow-x-auto transition-opacity ${
                isTableLoading ? 'pointer-events-none opacity-50' : ''
              }`}
            >
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  <tr>
                    <th className="px-4 py-3 sm:px-6">Title</th>
                    <th className="px-4 py-3 sm:px-6">Status</th>
                    <th className="hidden px-4 py-3 sm:table-cell sm:px-6">Deadline</th>
                    <th className="hidden px-4 py-3 md:table-cell md:px-6">Created</th>
                    <th className="px-4 py-3 text-right sm:px-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tasks.map((task) => {
                    const overdue = isTaskOverdue(task)

                    return (
                      <tr
                        key={task.id}
                        className={`transition-colors ${
                          overdue
                            ? 'bg-red-50 hover:bg-red-100/80'
                            : 'bg-white hover:bg-slate-50'
                        }`}
                      >
                        <td className="px-4 py-4 font-medium text-slate-900 sm:px-6">
                          <span className="inline-flex items-center gap-2">
                            {overdue ? (
                              <span aria-label="Overdue" title="Overdue">
                                ⚠️
                              </span>
                            ) : null}
                            {task.title}
                          </span>
                        </td>
                        <td className="px-4 py-4 sm:px-6">
                          <StatusBadge status={task.status} />
                        </td>
                        <td className="hidden px-4 py-4 text-slate-700 sm:table-cell sm:px-6">
                          {formatDateTime(task.deadline)}
                        </td>
                        <td className="hidden px-4 py-4 text-slate-700 md:table-cell md:px-6">
                          {formatDateTime(task.created_at)}
                        </td>
                        <td className="px-4 py-4 sm:px-6">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingTask(task)}
                              disabled={actionLoading || pageLoading}
                              className="btn-secondary px-3 py-1.5 text-xs"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setTaskToDelete(task)}
                              disabled={actionLoading || pageLoading}
                              className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <TaskPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              pageLoading={pageLoading}
              onPrevious={goToPreviousPage}
              onNext={goToNextPage}
              onGoToPage={goToPage}
            />
          </>
        )}
      </section>

      <TaskEditModal
        task={editingTask}
        open={Boolean(editingTask)}
        onClose={() => setEditingTask(null)}
        onSave={handleSave}
        saving={actionLoading}
      />

      <TaskDeleteModal
        task={taskToDelete}
        open={Boolean(taskToDelete)}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleConfirmDelete}
        loading={actionLoading}
      />
    </>
  )
}
