import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

// Node.js < 22 tidak punya native WebSocket — inject package 'ws' supaya
// @supabase/supabase-js bisa membuat RealtimeClient tanpa error.
let wsImpl
try {
  const wsModule = await import('ws')
  wsImpl = wsModule.default
} catch {
  // ws tidak tersedia, biarkan supabase pakai default (mungkin Node 22+)
}

let cachedAdmin = null
let warnedMissing = false

/**
 * Lazy-initialise the Supabase Admin client (uses the service-role key).
 * Returns null when env vars are missing so the rest of the API can still
 * boot. Endpoints that depend on Supabase (Google login verification,
 * storage uploads) treat a `null` return as "Supabase tidak dikonfigurasi".
 */
export function getSupabaseAdmin() {
  if (cachedAdmin) return cachedAdmin

  const url = process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    if (!warnedMissing) {
      console.warn(
        '[supabaseAdmin] SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY belum di-set. Fitur Supabase dimatikan.'
      )
      warnedMissing = true
    }
    return null
  }

  try {
    const options = {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }

    // Inject WebSocket implementation untuk Node.js < 22
    if (wsImpl) {
      options.realtime = { transport: wsImpl }
    }

    cachedAdmin = createClient(url, serviceKey, options)
    return cachedAdmin
  } catch (error) {
    console.error('[supabaseAdmin] Gagal membuat client:', error.message)
    return null
  }
}

export default getSupabaseAdmin
