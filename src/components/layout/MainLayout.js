'use client'

import Dashboard from '@/components/dashboard/Dashboard'
import UserAvatar from '@/components/UserAvatar'
import { TasksProvider } from '@/contexts/TasksContext'
import { useAuth } from '@/contexts/AuthContext'

export default function MainLayout({ children }) {
  const { logout, userId, username } = useAuth()

  return (
    <TasksProvider userId={userId}>
      <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
        <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center gap-3">
              <UserAvatar username={username} />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Interview App
                </p>
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  Task Manager
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:justify-end">
              {username ? (
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Welcome,{' '}
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {username}
                  </span>
                </p>
              ) : null}
              <button
                type="button"
                onClick={logout}
                className="btn-secondary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Log out
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
          <Dashboard />
          <main className="mt-8 space-y-8">{children}</main>
        </div>

        <footer className="border-t border-slate-200 bg-white py-4 text-center text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          © 2026 Task Manager | Next.js &amp; Supabase
        </footer>
      </div>
    </TasksProvider>
  )
}

