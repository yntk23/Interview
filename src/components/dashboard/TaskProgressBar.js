'use client'

import { getProgressPercent } from '@/lib/tasks'

export default function TaskProgressBar({ stats, loading }) {
  const percent = getProgressPercent(stats)

  return (
    <section className="mt-6">
      <header className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">Completion progress</span>
        <span className="font-semibold text-emerald-700">
          {loading ? '—' : `${percent}%`}
        </span>
      </header>

      <div
        className="h-3 w-full overflow-hidden rounded-full bg-slate-200"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Task completion progress"
      >
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-500 ease-out"
          style={{ width: loading ? '0%' : `${percent}%` }}
        />
      </div>

      <p className="mt-2 text-xs text-slate-500">
        {stats.done} of {stats.total} tasks completed
      </p>
    </section>
  )
}
