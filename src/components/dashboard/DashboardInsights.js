'use client'

import TaskCompletionTrendChart from '@/components/dashboard/TaskCompletionTrendChart'
import WeeklyWorkloadChart from '@/components/dashboard/WeeklyWorkloadChart'
import { useTasks } from '@/contexts/TasksContext'

export default function DashboardInsights() {
  const { tasks, loading } = useTasks()

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Insights
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Workload and completion trends from your task deadlines
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <article className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Weekly workload
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Tasks due Mon–Sun this week
          </p>
          <div className="mt-4">
            <WeeklyWorkloadChart tasks={tasks} loading={loading} />
          </div>
        </article>

        <article className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Task completion trend
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            DONE tasks over the last 7 days
          </p>
          <div className="mt-4">
            <TaskCompletionTrendChart tasks={tasks} loading={loading} />
          </div>
        </article>
      </div>
    </section>
  )
}
