'use client'

import Dashboard from '@/components/dashboard/Dashboard'
import { TasksProvider } from '@/contexts/TasksContext'
import { useAuth } from '@/contexts/AuthContext'

export default function MainLayout({ children }) {
  const { logout, userId } = useAuth()

  return (
    <TasksProvider userId={userId}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Interview App
              </p>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Task Manager
              </h1>
            </div>

            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Log out
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <Dashboard />

          <main className="mt-8 space-y-8">{children}</main>
        </div>
      </div>
    </TasksProvider>
  )
}
