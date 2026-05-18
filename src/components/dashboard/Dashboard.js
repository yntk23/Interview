'use client'

import DashboardInsights from '@/components/dashboard/DashboardInsights'
import TaskProgressBar from '@/components/dashboard/TaskProgressBar'
import { useTasks } from '@/contexts/TasksContext'

const STAT_CARDS = [
  {
    key: 'todo',
    label: 'TODO',
    accent: 'border-amber-200 bg-amber-50',
    labelClass: 'text-amber-900',
    valueClass: 'text-slate-900',
    highlight: false,
  },
  {
    key: 'doing',
    label: 'DOING',
    accent: 'border-sky-200 bg-sky-50',
    labelClass: 'text-sky-900',
    valueClass: 'text-slate-900',
    highlight: false,
  },
  {
    key: 'overdue',
    label: 'OVERDUE',
    accent: 'border-red-200 bg-red-50',
    labelClass: 'text-red-600',
    valueClass: 'text-red-600',
    highlight: false,
  },
  {
    key: 'done',
    label: 'DONE',
    accent: 'border-emerald-200 bg-emerald-50',
    labelClass: 'text-emerald-900',
    valueClass: 'text-slate-900',
    highlight: false,
  },
  {
    key: 'remaining',
    label: 'REMAINING',
    accent: 'border-2 border-indigo-400 bg-indigo-50',
    labelClass: 'text-indigo-900',
    valueClass: 'text-indigo-950',
    highlight: true,
  },
]

export default function Dashboard() {
  const { stats, loading, error } = useTasks()

  return (
    <div className="space-y-8">
      <section className="card-panel">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Task overview</h2>
          <p className="card-panel-muted mt-1 text-sm">
            Track open work, overdue alerts, and what is left to finish
          </p>
        </div>

        {error ? (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {STAT_CARDS.map(({ key, label, accent, labelClass, valueClass, highlight }) => (
            <article
              key={key}
              className={`rounded-xl p-4 ${accent} ${
                highlight ? 'shadow-md ring-1 ring-indigo-200/80' : ''
              }`}
            >
              <p
                className={`text-xs font-semibold uppercase tracking-wide ${labelClass}`}
              >
                {label}
              </p>
              <p className={`mt-2 text-3xl font-bold tabular-nums ${valueClass}`}>
                {loading ? '—' : stats[key]}
              </p>
            </article>
          ))}
        </div>

        <TaskProgressBar stats={stats} loading={loading} />
      </section>

      <DashboardInsights />
    </div>
  )
}
