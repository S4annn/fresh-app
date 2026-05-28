import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSupabase } from '../services/supabase'
import { loginGoogle } from '../services/authService'
import { setStoredToken, setStoredUser, normalizeRole } from '../utils/authStorage'

/**
 * Halaman callback OAuth Supabase.
 * Handle dua flow:
 * 1. PKCE flow: ?code= di URL query → supabase-js exchange otomatis
 * 2. Implicit flow: #access_token= di URL hash → parse manual
 */
export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const processed = useRef(false)

  useEffect(() => {
    if (processed.current) return
    processed.current = true

    async function handleCallback() {
      try {
        let accessToken = null

        // --- Coba implicit flow dulu (hash) ---
        const hash = window.location.hash
        if (hash && hash.includes('access_token')) {
          const params = new URLSearchParams(hash.replace(/^#/, ''))
          accessToken = params.get('access_token')
        }

        // --- Kalau tidak ada di hash, coba PKCE flow (query ?code=) ---
        if (!accessToken) {
          const client = getSupabase()
          if (client) {
            // supabase-js dengan detectSessionInUrl:true otomatis exchange ?code= → session
            let session = null
            const deadline = Date.now() + 8000
            while (!session && Date.now() < deadline) {
              const { data } = await client.auth.getSession()
              if (data?.session?.access_token) {
                session = data.session
                break
              }
              // eslint-disable-next-line no-await-in-loop
              await new Promise((r) => setTimeout(r, 300))
            }
            if (session?.access_token) {
              accessToken = session.access_token
            }
          }
        }

        // Bersihkan URL
        window.history.replaceState({}, '', window.location.pathname)

        if (!accessToken) {
          throw new Error('Token tidak ditemukan setelah login Google. Coba lagi.')
        }

        // Kirim ke backend untuk verifikasi & auto-provision user
        const data = await loginGoogle(accessToken)

        setStoredToken(data.token)
        setStoredUser(data.user)

        // Sign out dari Supabase di background — kita pakai JWT backend
        getSupabase()?.auth.signOut().catch(() => {})

        // Simpan pesan sukses — akan ditampilkan di dashboard setelah navigate
        try {
          sessionStorage.setItem('fresh:login_success', `Selamat datang, ${data.user?.name || 'Pengguna'}! Login Google berhasil.`)
        } catch { /* ignore */ }

        const role = normalizeRole(data.user?.role)
        navigate(
          role === 'bisnis' ? '/dashboard-bisnis' : '/dashboard',
          { replace: true }
        )
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[AuthCallback]', err)
        try {
          sessionStorage.setItem(
            'fresh:oauth_error',
            err?.message || 'Login Google gagal. Coba lagi.'
          )
        } catch {
          // ignore
        }
        navigate('/login', { replace: true })
      }
    }

    handleCallback()
  }, [navigate])

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        background: 'var(--color-bg, #f6f9f7)',
        fontFamily: 'var(--font-sans, sans-serif)',
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          border: '3px solid #e5ebe7',
          borderTopColor: '#176b2c',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: '#5a6a62', fontSize: 14, fontWeight: 500 }}>
        Menyelesaikan login Google...
      </p>
    </div>
  )
}
