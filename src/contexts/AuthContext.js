'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'

const STORAGE_KEY = 'user_id'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [userId, setUserId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      setUserId(stored)
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (username) => {
    const trimmed = username.trim()
    if (!trimmed) {
      setError('Username is required')
      return false
    }

    setAuthLoading(true)
    setError(null)

    try {
      const { data: existing, error: selectError } = await supabase
        .from('users')
        .select('user_id')
        .eq('username', trimmed)
        .maybeSingle()

      if (selectError) {
        throw selectError
      }

      let id = existing?.user_id

      if (!id) {
        const { data: created, error: insertError } = await supabase
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
      localStorage.setItem(STORAGE_KEY, String(id))
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
    localStorage.removeItem(STORAGE_KEY)
    setError(null)
  }, [])

  const value = useMemo(
    () => ({
      userId,
      isLoggedIn: Boolean(userId),
      loading,
      authLoading,
      error,
      login,
      logout,
    }),
    [userId, loading, authLoading, error, login, logout],
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
