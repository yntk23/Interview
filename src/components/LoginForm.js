'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginForm() {
  const { login, authLoading, error } = useAuth()
  const [username, setUsername] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    await login(username)
  }

  return (
    <section className="card-panel w-full max-w-md">
      <h1 className="text-2xl font-bold text-slate-900">Sign in</h1>
      <p className="card-panel-muted mt-2 text-sm">Enter your username to continue.</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <label htmlFor="username" className="field-label">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          placeholder="your-username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          disabled={authLoading}
          required
          className="field-input"
        />

        {error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : null}

        <button
          type="submit"
          disabled={authLoading}
          className="btn-primary mt-2"
        >
          {authLoading ? 'Signing in...' : 'Continue'}
        </button>
      </form>
    </section>
  )
}
