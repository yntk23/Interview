'use client'

import { useMemo, useState } from 'react'
import StatusBadge from '@/components/tasks/StatusBadge'
import TaskEditModal from '@/components/tasks/TaskEditModal'
import TaskFilterTabs from '@/components/tasks/TaskFilterTabs'
import { useTasks } from '@/contexts/TasksContext'
import { downloadTasksCsv } from '@/lib/exportTasksCsv'
import { filterTasks, formatDateTime, isTaskOverdue } from '@/lib/tasks'

export default function TaskList() {
  const { tasks, loading, actionLoading, editTask, removeTask } = useTasks()
  const [editingTask, setEditingTask] = useState(null)
  const [activeFilter, setActiveFilter] = useState('ALL')

  const filteredTasks = useMemo(
    () => filterTasks(tasks, activeFilter),
    [tasks, activeFilter],
  )

  async function handleSave(payload) {
    if (!editingTask) {
      return
    }
    await editTask(editingTask.id, payload)
  }

  async function handleDelete(task) {
    const confirmed = window.confirm('Are you sure?')
    if (!confirmed) {
      return
    }
    await removeTask(task.id)
  }

  function handleExportCsv() {
    downloadTasksCsv(filteredTasks)
  }

  if (loading) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Loading tasks...</p>
      </section>
    )
  }

  return (
    <>
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <header className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Your tasks</h2>
          <p className="mt-1 text-sm text-slate-500">
            {activeFilter === 'ALL'
              ? `${tasks.length} task${tasks.length === 1 ? '' : 's'} total`
              : `${filteredTasks.length} of ${tasks.length} task${tasks.length === 1 ? '' : 's'} shown`}
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <TaskFilterTabs
              activeFilter={activeFilter}
              onChange={setActiveFilter}
            />

            <button
              type="button"
              onClick={handleExportCsv}
              disabled={filteredTasks.length === 0}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span aria-hidden="true">⬇</span>
              Export CSV
            </button>
          </div>
        </header>

        {tasks.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-slate-500">
            No tasks yet. Add your first task above.
          </p>
        ) : filteredTasks.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-slate-500">
            No tasks match this filter.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3">Title</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Deadline</th>
                  <th className="px-6 py-3">Created</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.map((task) => {
                  const overdue = isTaskOverdue(task)

                  return (
                    <tr
                      key={task.id}
                      className={
                        overdue
                          ? 'bg-red-50/80'
                          : 'bg-white hover:bg-slate-50/80'
                      }
                    >
                      <td className="px-6 py-4 font-medium text-slate-900">
                        <span className="inline-flex items-center gap-2">
                          {overdue ? (
                            <span aria-label="Overdue" title="Overdue">
                              ⚠️
                            </span>
                          ) : null}
                          {task.title}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={task.status} />
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {formatDateTime(task.deadline)}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {formatDateTime(task.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingTask(task)}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-white"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(task)}
                            disabled={actionLoading}
                            className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-60"
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
        )}
      </section>

      <TaskEditModal
        task={editingTask}
        open={Boolean(editingTask)}
        onClose={() => setEditingTask(null)}
        onSave={handleSave}
        saving={actionLoading}
      />
    </>
  )
}
