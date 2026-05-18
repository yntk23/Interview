'use client'

import TaskCompletionTrendChart from '@/components/dashboard/TaskCompletionTrendChart'
import WeeklyWorkloadChart from '@/components/dashboard/WeeklyWorkloadChart'
import { useTasks } from '@/contexts/TasksContext'

export default function DashboardInsights() {
  const { analyticsTasks, loading } = useTasks()

  return (
    <section className="card-panel">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Insights</h2>
        <p className="card-panel-muted mt-1 text-sm">
          Workload and completion trends from your task deadlines
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-900">Weekly workload</h3>
          <p className="card-panel-muted mt-1 text-xs">Tasks due Mon–Sun this week</p>
          <div className="mt-4">
            <WeeklyWorkloadChart tasks={analyticsTasks} loading={loading} />
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-900">Task completion trend</h3>
          <p className="card-panel-muted mt-1 text-xs">DONE tasks over the last 7 days</p>
          <div className="mt-4">
            <TaskCompletionTrendChart tasks={analyticsTasks} loading={loading} />
          </div>
        </article>
      </div>
    </section>
  )
}
