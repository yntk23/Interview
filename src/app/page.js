'use client'

import LoginForm from '@/components/LoginForm'
import MainLayout from '@/components/layout/MainLayout'
import TaskForm from '@/components/tasks/TaskForm'
import TaskList from '@/components/tasks/TaskList'
import { useAuth } from '@/contexts/AuthContext'

export default function Home() {
  const { isLoggedIn, loading } = useAuth()

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-slate-500">Loading session...</p>
      </main>
    )
  }

  if (!isLoggedIn) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <LoginForm />
      </main>
    )
  }

  return (
    <MainLayout>
      <TaskForm />
      <TaskList />
    </MainLayout>
  )
}
