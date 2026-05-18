'use client'

import { TASK_FILTERS } from '@/lib/tasks'

export default function TaskFilterTabs({ activeFilter, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {TASK_FILTERS.map(({ id, label }) => {
        const isActive = activeFilter === id

        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              isActive
                ? 'bg-blue-600 text-white shadow-sm'
                : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
