'use client'

import { useState } from 'react'
import { TASK_PRIORITIES } from '@/lib/priority'
import { TASK_STATUSES, fromDatetimeLocalValue } from '@/lib/tasks'
import { useTasks } from '@/contexts/TasksContext'

const INITIAL_FORM = {
  title: '',
  status: 'TODO',
  priority: 'MEDIUM',
  deadline: '',
}

export default function TaskForm() {
  const { addTask, actionLoading } = useTasks()
  const [form, setForm] = useState(INITIAL_FORM)
  const [formError, setFormError] = useState(null)

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError(null)

    if (!form.title.trim()) {
      setFormError('Title is required')
      return
    }

    try {
      await addTask({
        title: form.title,
        status: form.status,
        priority: form.priority,
        deadline: fromDatetimeLocalValue(form.deadline),
      })
      setForm(INITIAL_FORM)
    } catch {
      // Toast handled in TasksContext
    }
  }

  return (
    <section className="card-panel">
      <h2 className="text-lg font-semibold text-slate-900">Add task</h2>
      <p className="card-panel-muted mt-1 text-sm">Create a new task for your workspace.</p>

      <form onSubmit={handleSubmit} className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="task-title" className="field-label">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="task-title"
            type="text"
            value={form.title}
            onChange={(event) => updateField('title', event.target.value)}
            required
            disabled={actionLoading}
            placeholder="Task title"
            className="field-input"
          />
        </div>

        <div>
          <label htmlFor="task-status" className="field-label">
            Status
          </label>
          <select
            id="task-status"
            value={form.status}
            onChange={(event) => updateField('status', event.target.value)}
            disabled={actionLoading}
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
          <label htmlFor="task-priority" className="field-label">
            Priority
          </label>
          <select
            id="task-priority"
            value={form.priority}
            onChange={(event) => updateField('priority', event.target.value)}
            disabled={actionLoading}
            className="field-input"
          >
            {TASK_PRIORITIES.map((value) => (
              <option key={value} value={value}>
                {value.charAt(0) + value.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="task-deadline" className="field-label">
            Deadline
          </label>
          <input
            id="task-deadline"
            type="datetime-local"
            value={form.deadline}
            onChange={(event) => updateField('deadline', event.target.value)}
            onClick={(event) => {
              if (typeof event.target.showPicker === 'function') {
                event.target.showPicker()
              }
            }}
            disabled={actionLoading}
            className="field-input cursor-pointer"
          />
        </div>

        {formError ? (
          <p className="sm:col-span-2 text-sm text-red-600">{formError}</p>
        ) : null}

        <div className="sm:col-span-2">
          <button type="submit" disabled={actionLoading} className="btn-primary">
            {actionLoading ? 'Adding...' : 'Add task'}
          </button>
        </div>
      </form>
    </section>
  )
}
