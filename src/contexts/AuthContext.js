'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getSupabase } from '@/lib/supabase'

const USER_ID_KEY = 'user_id'
const USERNAME_KEY = 'username'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [userId, setUserId] = useState(null)
  const [username, setUsername] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadUsername = useCallback(async (id) => {
    const storedUsername = localStorage.getItem(USERNAME_KEY)
    if (storedUsername) {
      setUsername(storedUsername)
      return
    }

    const { data, error: fetchError } = await getSupabase()
      .from('users')
      .select('username')
      .eq('user_id', id)
      .maybeSingle()

    if (!fetchError && data?.username) {
      setUsername(data.username)
      localStorage.setItem(USERNAME_KEY, data.username)
    }
  }, [])

  useEffect(() => {
    const storedUserId = localStorage.getItem(USER_ID_KEY)
    if (!storedUserId) {
      setLoading(false)
      return
    }

    setUserId(storedUserId)
    loadUsername(storedUserId).finally(() => setLoading(false))
  }, [loadUsername])

  const login = useCallback(async (rawUsername) => {
    const trimmed = rawUsername.trim()
    if (!trimmed) {
      setError('Username is required')
      return false
    }

    setAuthLoading(true)
    setError(null)

    try {
      const { data: existing, error: selectError } = await getSupabase()
        .from('users')
        .select('user_id')
        .eq('username', trimmed)
        .maybeSingle()

      if (selectError) {
        throw selectError
      }

      let id = existing?.user_id

      if (!id) {
        const { data: created, error: insertError } = await getSupabase()
          .from('users')
          .insert({ username: trimmed })
          .select('user_id')
          .single()

        if (insertError) {
          throw insertError
        }

        id = created.user_id
      }

      setUserId(String(id))
      setUsername(trimmed)
      localStorage.setItem(USER_ID_KEY, String(id))
      localStorage.setItem(USERNAME_KEY, trimmed)
      return true
    } catch (err) {
      setError(err.message ?? 'Login failed')
      return false
    } finally {
      setAuthLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setUserId(null)
    setUsername(null)
    localStorage.removeItem(USER_ID_KEY)
    localStorage.removeItem(USERNAME_KEY)
    setError(null)
  }, [])

  const value = useMemo(
    () => ({
      userId,
      username,
      isLoggedIn: Boolean(userId),
      loading,
      authLoading,
      error,
      login,
      logout,
    }),
    [userId, username, loading, authLoading, error, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
