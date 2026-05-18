'use client'

import Dashboard from '@/components/dashboard/Dashboard'
import { TasksProvider } from '@/contexts/TasksContext'
import { useAuth } from '@/contexts/AuthContext'

export default function MainLayout({ children }) {
  const { logout, userId } = useAuth()

  return (
    <TasksProvider userId={userId}>
      <div className="min-h-screen bg-slate-50">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Interview App
              </p>
              <h1 className="text-xl font-bold text-slate-900">Task Manager</h1>
            </div>

            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
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
