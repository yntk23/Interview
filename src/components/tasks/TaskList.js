'use client'

import { useMemo, useState } from 'react'
import BulkActionToolbar from '@/components/tasks/BulkActionToolbar'
import BulkDeleteModal from '@/components/tasks/BulkDeleteModal'
import SortableHeader from '@/components/tasks/SortableHeader'
import StatusBadge from '@/components/tasks/StatusBadge'
import TaskDeleteModal from '@/components/tasks/TaskDeleteModal'
import TaskEditModal from '@/components/tasks/TaskEditModal'
import TaskEmptyState from '@/components/tasks/TaskEmptyState'
import TaskFilterTabs from '@/components/tasks/TaskFilterTabs'
import TaskPriorityFilter from '@/components/tasks/TaskPriorityFilter'
import TaskPagination from '@/components/tasks/TaskPagination'
import { useAuth } from '@/contexts/AuthContext'
import { useTasks } from '@/contexts/TasksContext'
import { getPriorityStyles } from '@/lib/priority'
import { downloadTasksCsv } from '@/lib/exportTasksCsv'
import {
  fetchTasksForExport,
  formatChartDayLabel,
  formatDateTime,
  isTaskOverdue,
} from '@/lib/tasks'
import { toast } from 'sonner'

export default function TaskList() {
  const { userId } = useAuth()
  const {
    tasks,
    loading,
    pageLoading,
    actionLoading,
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
    selectedIds,
    setActiveFilter,
    setPriorityFilter,
    toggleSort,
    clearChartDayFilter,
    goToPage,
    goToPreviousPage,
    goToNextPage,
    toggleSelectTask,
    toggleSelectAllOnPage,
    editTask,
    removeTask,
    bulkMarkDone,
    bulkRemoveTasks,
  } = useTasks()

  const [editingTask, setEditingTask] = useState(null)
  const [taskToDelete, setTaskToDelete] = useState(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [exporting, setExporting] = useState(false)

  const selectedCount = selectedIds.size
  const pageIds = tasks.map((task) => task.id)
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id))

  const emptyVariant = useMemo(() => {
    if (searchInput.trim()) {
      return 'SEARCH'
    }
    if (chartDeadlineDay) {
      return 'CHART_DAY'
    }
    return activeFilter
  }, [searchInput, chartDeadlineDay, activeFilter])

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

  async function handleBulkDelete() {
    const ids = [...selectedIds]
    try {
      await bulkRemoveTasks(ids)
      setBulkDeleteOpen(false)
    } catch {
      // Toast handled in TasksContext
    }
  }

  async function handleBulkMarkDone() {
    const ids = [...selectedIds]
    try {
      await bulkMarkDone(ids)
    } catch {
      // Toast handled in TasksContext
    }
  }

  async function handleExportCsv() {
    setExporting(true)
    try {
      const exportTasks = await fetchTasksForExport(userId, {
        filterId: activeFilter,
        priorityFilter,
        search: searchInput.trim(),
        sortColumn,
        sortDirection,
        chartDeadlineDay,
      })
      downloadTasksCsv(exportTasks)
    } catch (err) {
      toast.error(err.message ?? 'Failed to export tasks')
    } finally {
      setExporting(false)
    }
  }

  const showEmpty = !loading && totalCount === 0
  const isTableLoading = pageLoading
  const selectionDisabled = actionLoading || pageLoading

  function getTaskRowClassName(isSelected, overdue) {
    const base = 'relative cursor-pointer transition-colors duration-150'

    if (isSelected) {
      return `${base} bg-blue-50/50 hover:bg-blue-100/50`
    }

    if (overdue) {
      return `${base} bg-red-50/80 hover:bg-red-100/60`
    }

    return `${base} bg-white hover:bg-slate-50`
  }

  function handleRowSelect(taskId) {
    if (selectionDisabled) {
      return
    }
    toggleSelectTask(taskId)
  }

  function handleRowKeyDown(event, taskId) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleRowSelect(taskId)
    }
  }

  if (loading && totalCount === 0 && !searchInput) {
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
                  activeFilter === 'ALL' && !chartDeadlineDay && !searchInput.trim()
                    ? 'total'
                    : 'matching filters'
                }`}
          </p>

          <div className="mt-4">
            <label htmlFor="task-search" className="sr-only">
              Search tasks
            </label>
            <input
              id="task-search"
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search tasks by title..."
              className="field-input"
            />
          </div>

          {chartDeadlineDay ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                Chart filter: {formatChartDayLabel(chartDeadlineDay)}
              </span>
              <button
                type="button"
                onClick={clearChartDayFilter}
                className="text-xs font-semibold text-blue-700 underline hover:text-blue-900"
              >
                Clear Chart Filter
              </button>
            </div>
          ) : null}

          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-3">
              <TaskFilterTabs
                activeFilter={activeFilter}
                onChange={setActiveFilter}
                disabled={loading || pageLoading}
              />
              <TaskPriorityFilter
                activePriority={priorityFilter}
                onChange={setPriorityFilter}
                disabled={loading || pageLoading}
              />
            </div>

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

        <BulkActionToolbar
          selectedCount={selectedCount}
          onMarkDone={handleBulkMarkDone}
          onDelete={() => setBulkDeleteOpen(true)}
          loading={actionLoading}
        />

        {showEmpty ? (
          <TaskEmptyState
            variant={emptyVariant}
            chartDayLabel={
              chartDeadlineDay ? formatChartDayLabel(chartDeadlineDay) : undefined
            }
          />
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
                    <th className="w-10 px-4 py-3 sm:px-6">
                      <input
                        type="checkbox"
                        checked={allPageSelected}
                        onChange={toggleSelectAllOnPage}
                        disabled={actionLoading || pageLoading}
                        aria-label="Select all tasks on this page"
                        className="h-4 w-4 rounded border-slate-300 text-blue-600"
                      />
                    </th>
                    <SortableHeader
                      label="Title"
                      column="title"
                      sortColumn={sortColumn}
                      sortDirection={sortDirection}
                      onSort={toggleSort}
                      className="px-4 py-3 sm:px-6"
                    />
                    <th className="px-4 py-3 sm:px-6">Status</th>
                    <SortableHeader
                      label="Deadline"
                      column="deadline"
                      sortColumn={sortColumn}
                      sortDirection={sortDirection}
                      onSort={toggleSort}
                      className="hidden px-4 py-3 sm:table-cell sm:px-6"
                    />
                    <SortableHeader
                      label="Created"
                      column="created"
                      sortColumn={sortColumn}
                      sortDirection={sortDirection}
                      onSort={toggleSort}
                      className="hidden px-4 py-3 md:table-cell md:px-6"
                    />
                    <th className="px-4 py-3 text-right sm:px-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tasks.map((task) => {
                    const overdue = isTaskOverdue(task)
                    const { bar } = getPriorityStyles(task.priority)
                    const isSelected = selectedIds.has(task.id)

                    return (
                      <tr
                        key={task.id}
                        role="row"
                        tabIndex={selectionDisabled ? -1 : 0}
                        aria-selected={isSelected}
                        onClick={() => handleRowSelect(task.id)}
                        onKeyDown={(event) => handleRowKeyDown(event, task.id)}
                        className={getTaskRowClassName(isSelected, overdue)}
                      >
                        <td className="relative px-4 py-4 sm:px-6">
                          <span
                            className={`pointer-events-none absolute bottom-0 left-0 top-0 w-1 ${bar}`}
                            aria-hidden="true"
                          />
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onClick={(event) => event.stopPropagation()}
                            onChange={() => handleRowSelect(task.id)}
                            disabled={selectionDisabled}
                            aria-label={`Select ${task.title}`}
                            className="h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600"
                          />
                        </td>
                        <td className="px-4 py-4 font-medium text-slate-900 sm:px-6">
                          <span className="inline-flex items-center gap-1.5">
                            {overdue ? (
                              <span aria-label="Overdue" title="Overdue">
                                ⚠️
                              </span>
                            ) : null}
                            <span>{task.title}</span>
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
                          <div
                            className="flex justify-end gap-2"
                            onClick={(event) => event.stopPropagation()}
                            onKeyDown={(event) => event.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation()
                                setEditingTask(task)
                              }}
                              disabled={selectionDisabled}
                              className="btn-secondary px-3 py-1.5 text-xs"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation()
                                setTaskToDelete(task)
                              }}
                              disabled={selectionDisabled}
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

      <BulkDeleteModal
        count={selectedCount}
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={handleBulkDelete}
        loading={actionLoading}
      />
    </>
  )
}
