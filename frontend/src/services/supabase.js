import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const isConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// Diagnostic logs untuk dev — terlihat di browser DevTools console.
// Membantu deteksi env yang tidak ke-load (mis. dev server lupa di-restart).
if (typeof window !== 'undefined') {
  // eslint-disable-next-line no-console
  console.info('[supabase] config check', {
    hasUrl: Boolean(supabaseUrl),
    hasAnonKey: Boolean(supabaseAnonKey),
    urlPreview: supabaseUrl ? `${supabaseUrl.slice(0, 30)}...` : '(kosong)',
  })
}

let cachedClient = null

export function getSupabase() {
  if (!isConfigured) return null
  if (!cachedClient) {
    cachedClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  }
  return cachedClient
}

export const supabase = getSupabase()

/**
 * Mulai OAuth Google via Supabase. Pakai `signInWithOAuth` yang akan redirect
 * ke Google, lalu setelah callback Supabase akan menaruh session di URL hash.
 */
export async function signInWithGoogle(redirectPath = '/auth/callback') {
  const client = getSupabase()
  if (!client) {
    if (!supabaseUrl) {
      throw new Error(
        'VITE_SUPABASE_URL belum di-set. Restart dev server (npm run dev) setelah mengisi frontend/.env.'
      )
    }
    if (!supabaseAnonKey) {
      throw new Error(
        'VITE_SUPABASE_ANON_KEY belum di-set. Restart dev server (npm run dev) setelah mengisi frontend/.env.'
      )
    }
    throw new Error(
      'Login Google belum dikonfigurasi. Hubungi admin untuk mengaktifkan fitur ini.'
    )
  }
  const redirectTo = `${window.location.origin}${redirectPath}`
  const { error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: {
        prompt: 'select_account',
      },
    },
  })
  if (error) throw error
}

/**
 * Setelah redirect dari Google, Supabase otomatis menyimpan session.
 * Function ini ambil access token-nya supaya bisa dikirim ke backend
 * untuk verifikasi.
 */
export async function getSupabaseAccessToken() {
  const client = getSupabase()
  if (!client) return null
  const { data } = await client.auth.getSession()
  return data?.session?.access_token || null
}

export async function signOutSupabase() {
  const client = getSupabase()
  if (!client) return
  await client.auth.signOut()
}
