'use client'

import { useEffect, useState } from 'react'
import { TASK_STATUSES } from '@/lib/tasks'

export default function TaskEditModal({ task, open, onClose, onSave, saving }) {
  const [title, setTitle] = useState('')
  const [status, setStatus] = useState('TODO')

  useEffect(() => {
    if (task) {
      setTitle(task.title ?? '')
      setStatus(task.status ?? 'TODO')
    }
  }, [task])

  if (!open || !task) {
    return null
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!title.trim()) {
      return
    }
    await onSave({ title: title.trim(), status })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-task-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <h3 id="edit-task-title" className="text-lg font-semibold text-slate-900">
          Edit task
        </h3>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="edit-title" className="text-sm font-medium text-slate-700">
              Title
            </label>
            <input
              id="edit-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label htmlFor="edit-status" className="text-sm font-medium text-slate-700">
              Status
            </label>
            <select
              id="edit-status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            >
              {TASK_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
