import { createClient } from '@supabase/supabase-js'

function normalizeSupabaseUrl(url) {
  let normalized = url.trim()

  // Project URL only — not the REST endpoint (e.g. .../rest/v1)
  normalized = normalized.replace(/\/rest\/v1\/?$/i, '')
  normalized = normalized.replace(/\/+$/, '')

  return normalized
}

function normalizeSupabaseKey(key) {
  return key.trim()
}

let supabaseClient = null

export function getSupabase() {
  if (supabaseClient) {
    return supabaseClient
  }

  const supabaseUrl = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '')
  const supabaseAnonKey = normalizeSupabaseKey(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  )

  if (!supabaseUrl) {
    throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
  }

  if (!supabaseAnonKey) {
    throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  if (!/^https?:\/\//i.test(supabaseUrl)) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL must be a project URL like https://<ref>.supabase.co (no /rest/v1 path)',
    )
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  return supabaseClient
}
