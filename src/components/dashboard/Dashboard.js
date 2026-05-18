'use client'

import TaskProgressBar from '@/components/dashboard/TaskProgressBar'
import { useTasks } from '@/contexts/TasksContext'

const STAT_CARDS = [
  { key: 'todo', label: 'TODO', accent: 'border-amber-200 bg-amber-50 text-amber-800' },
  { key: 'doing', label: 'DOING', accent: 'border-sky-200 bg-sky-50 text-sky-800' },
  { key: 'done', label: 'DONE', accent: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
  { key: 'total', label: 'Total Tasks', accent: 'border-slate-200 bg-slate-50 text-slate-800' },
]

export default function Dashboard() {
  const { stats, loading, error } = useTasks()

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Task overview</h2>
        <p className="mt-1 text-sm text-slate-500">
          Status counts for your workspace
        </p>
      </div>

      {error ? (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {STAT_CARDS.map(({ key, label, accent }) => (
          <article
            key={key}
            className={`rounded-xl border p-4 ${accent}`}
          >
            <p className="text-xs font-semibold uppercase tracking-wide opacity-80">
              {label}
            </p>
            <p className="mt-2 text-3xl font-bold tabular-nums">
              {loading ? '—' : stats[key]}
            </p>
          </article>
        ))}
      </div>

      <TaskProgressBar stats={stats} loading={loading} />
    </section>
  )
}
