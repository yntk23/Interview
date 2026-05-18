'use client'

import { useState } from 'react'
import { TASK_STATUSES, fromDatetimeLocalValue } from '@/lib/tasks'
import { useTasks } from '@/contexts/TasksContext'

const INITIAL_FORM = {
  title: '',
  status: 'TODO',
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
        deadline: fromDatetimeLocalValue(form.deadline),
      })
      setForm(INITIAL_FORM)
    } catch {
      // Error surfaced via TasksContext
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Add task</h2>
      <p className="mt-1 text-sm text-slate-500">
        Create a new task for your workspace.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="task-title" className="text-sm font-medium text-slate-700">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="task-title"
            type="text"
            value={form.title}
            onChange={(event) => updateField('title', event.target.value)}
            required
            placeholder="Task title"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div>
          <label htmlFor="task-status" className="text-sm font-medium text-slate-700">
            Status
          </label>
          <select
            id="task-status"
            value={form.status}
            onChange={(event) => updateField('status', event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          >
            {TASK_STATUSES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="task-deadline" className="text-sm font-medium text-slate-700">
            Deadline
          </label>
          <input
            id="task-deadline"
            type="datetime-local"
            value={form.deadline}
            onChange={(event) => updateField('deadline', event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        {formError ? (
          <p className="sm:col-span-2 text-sm text-red-600">{formError}</p>
        ) : null}

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={actionLoading}
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {actionLoading ? 'Adding...' : 'Add task'}
          </button>
        </div>
      </form>
    </section>
  )
}
