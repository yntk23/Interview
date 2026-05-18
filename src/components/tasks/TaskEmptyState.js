'use client'

const EMPTY_CONFIG = {
  ALL: {
    icon: '📋',
    title: 'No tasks yet',
    message: 'Create your first task using the form above.',
    theme: 'default',
  },
  TODO: {
    icon: '✅',
    title: 'No to-do tasks',
    message: 'You have cleared your to-do list for now.',
    theme: 'default',
  },
  DOING: {
    icon: '🚀',
    title: 'Nothing in progress',
    message: 'Start a task and set its status to DOING.',
    theme: 'default',
  },
  DONE: {
    icon: '🎯',
    title: 'No completed tasks',
    message: 'Finished work will appear here.',
    theme: 'default',
  },
  OVERDUE: {
    icon: '🎉',
    title: 'Congratulations! You are all caught up!',
    message: 'No overdue tasks right now. Great job staying on track.',
    theme: 'success',
  },
  SEARCH: {
    icon: '🔍',
    title: 'No matching tasks',
    message: 'Try a different search term or clear filters.',
    theme: 'default',
  },
  CHART_DAY: {
    icon: '📅',
    title: 'No tasks due on this day',
    message: 'Pick another bar on the chart or clear the chart filter.',
    theme: 'default',
  },
}

export default function TaskEmptyState({ variant = 'ALL', chartDayLabel }) {
  const config = EMPTY_CONFIG[variant] ?? EMPTY_CONFIG.ALL
  const isSuccess = config.theme === 'success'

  return (
    <div
      className={`mx-4 my-10 rounded-xl border px-6 py-10 text-center sm:mx-6 ${
        isSuccess
          ? 'border-emerald-200 bg-emerald-50'
          : 'border-slate-200 bg-slate-50'
      }`}
    >
      <p className="text-4xl" aria-hidden="true">
        {config.icon}
      </p>
      <h3
        className={`mt-3 text-lg font-semibold ${
          isSuccess ? 'text-emerald-900' : 'text-slate-900'
        }`}
      >
        {config.title}
      </h3>
      <p
        className={`mt-2 text-sm ${
          isSuccess ? 'text-emerald-800' : 'text-slate-600'
        }`}
      >
        {variant === 'CHART_DAY' && chartDayLabel
          ? `No deadlines on ${chartDayLabel}.`
          : config.message}
      </p>
    </div>
  )
}
