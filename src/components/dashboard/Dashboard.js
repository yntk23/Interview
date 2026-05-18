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
  },
  {
    key: 'doing',
    label: 'DOING',
    accent: 'border-sky-200 bg-sky-50',
    labelClass: 'text-sky-900',
    valueClass: 'text-slate-900',
  },
  {
    key: 'done',
    label: 'DONE',
    accent: 'border-emerald-200 bg-emerald-50',
    labelClass: 'text-emerald-900',
    valueClass: 'text-slate-900',
  },
  {
    key: 'total',
    label: 'Total Tasks',
    accent: 'border-slate-200 bg-slate-100',
    labelClass: 'text-slate-700',
    valueClass: 'text-slate-900',
  },
]

export default function Dashboard() {
  const { stats, loading, error } = useTasks()

  return (
    <div className="space-y-8">
      <section className="card-panel">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Task overview</h2>
          <p className="card-panel-muted mt-1 text-sm">Status counts for your workspace</p>
        </div>

        {error ? (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {STAT_CARDS.map(({ key, label, accent, labelClass, valueClass }) => (
            <article
              key={key}
              className={`rounded-xl border p-4 ${accent}`}
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
