'use client'

import { useEffect, useState } from 'react'
import Modal from '@/components/ui/Modal'
import { TASK_PRIORITIES } from '@/lib/priority'
import { TASK_STATUSES } from '@/lib/tasks'

export default function TaskEditModal({ task, open, onClose, onSave, saving }) {
  const [title, setTitle] = useState('')
  const [status, setStatus] = useState('TODO')
  const [priority, setPriority] = useState('MEDIUM')

  useEffect(() => {
    if (task) {
      setTitle(task.title ?? '')
      setStatus(task.status ?? 'TODO')
      setPriority(task.priority ?? 'MEDIUM')
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

    try {
      await onSave({ title: title.trim(), status, priority })
      onClose()
    } catch {
      // Toast handled in TasksContext
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      dismissible={!saving}
      overlayClassName="bg-slate-900/40"
      aria-labelledby="edit-task-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-xl">
        <h3 id="edit-task-title" className="text-lg font-semibold text-slate-900">
          Edit task
        </h3>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="edit-title" className="field-label">
              Title
            </label>
            <input
              id="edit-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              disabled={saving}
              className="field-input"
            />
          </div>

          <div>
            <label htmlFor="edit-status" className="field-label">
              Status
            </label>
            <select
              id="edit-status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              disabled={saving}
              className="field-input"
            >
              {TASK_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="edit-priority" className="field-label">
              Priority
            </label>
            <select
              id="edit-priority"
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
              disabled={saving}
              className="field-input"
            >
              {TASK_PRIORITIES.map((value) => (
                <option key={value} value={value}>
                  {value.charAt(0) + value.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} disabled={saving} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
