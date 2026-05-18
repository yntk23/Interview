'use client'

import { PRIORITY_FILTERS } from '@/lib/priority'

export default function TaskPriorityFilter({
  activePriority,
  onChange,
  disabled = false,
}) {
  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="group"
      aria-label="Filter by priority"
    >
      <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
        Priority
      </span>
      <div className="flex flex-wrap gap-2">
        {PRIORITY_FILTERS.map(({ id, label }) => {
          const isActive = activePriority === id

          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              disabled={disabled}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
                isActive
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
