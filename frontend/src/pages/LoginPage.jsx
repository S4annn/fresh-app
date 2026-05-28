import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, Sparkles, Leaf, ShieldCheck, Recycle, ArrowRight, ArrowLeft } from 'lucide-react'
import { login } from '../services/authService'
import { signInWithGoogle } from '../services/supabase'
import { useFeedback } from '../components/feedback/feedbackContext'
import { setStoredToken, setStoredUser, normalizeRole } from '../utils/authStorage'
import logo from '../assets/images/logo.png'
import '../styles/auth.css'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.5-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.5 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3-3.3 5.4-6 7l6.2 5.2C39.7 36.5 44 31 44 24c0-1.3-.1-2.3-.4-3.5z" />
    </svg>
  )
}

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const feedback = useFeedback()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  function goToDashboard(user) {
    const role = normalizeRole(user?.role)
    const redirect = location.state?.from
    if (redirect && redirect !== '/login' && redirect !== '/') {
      navigate(redirect, { replace: true })
      return
    }
    navigate(role === 'bisnis' ? '/dashboard-bisnis' : '/dashboard', { replace: true })
  }

  // Tampilkan error dari OAuth callback kalau ada
  useEffect(() => {
    try {
      const oauthError = sessionStorage.getItem('fresh:oauth_error')
      if (oauthError) {
        sessionStorage.removeItem('fresh:oauth_error')
        feedback.error(oauthError, { title: 'Login Google gagal', duration: 6000 })
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (loading) return
    if (!email.trim() || !password.trim()) {
      feedback.warning('Email dan password wajib diisi.')
      return
    }
    try {
      setLoading(true)
      const data = await login({
        email: email.trim().toLowerCase(),
        password: password.trim(),
      })
      setStoredToken(data.token)
      setStoredUser(data.user)
      feedback.success(`Selamat datang kembali, ${data.user?.name || 'Pengguna'}!`)
      goToDashboard(data.user)
    } catch (error) {
      feedback.error(error.message || 'Login gagal. Periksa kembali kredensial Anda.', {
        title: 'Login gagal',
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleLogin() {
    if (loading) return
    try {
      setLoading(true)
      // Memulai redirect ke Google. Browser akan navigate keluar dari halaman ini,
      // jadi kode setelah baris ini biasanya tidak akan tereksekusi.
      await signInWithGoogle()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[Google Login init error]', error)
      const message = error?.message || 'Login Google gagal.'
      feedback.error(message, { title: 'Login Google gagal', duration: 6000 })
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <aside className="auth-page__visual">
        <Link to="/" className="auth-page__brand">
          <img src={logo} alt="" />
          <div>
            <h1>F.R.E.S.H</h1>
            <p>Pengelolaan Pangan Berbasis AI</p>
          </div>
        </Link>
        <div className="auth-page__hero">
          <span className="auth-page__tag">
            <Sparkles size={12} strokeWidth={2.6} />
            Pengelolaan Pangan Cerdas
          </span>
          <h2>
            Selamat datang kembali di <span>F.R.E.S.H</span>
          </h2>
          <p>
            Lanjutkan kelola stok pangan, deteksi risiko kedaluwarsa, dan ubah
            surplus jadi peluang lewat marketplace dan donasi.
          </p>
          <div className="auth-page__benefits">
            <div className="auth-page__benefit">
              <span className="auth-page__benefit-icon">
                <Leaf size={16} strokeWidth={2.4} />
              </span>
              <span>Pantau inventaris dan risiko pemborosan pangan secara real-time.</span>
            </div>
            <div className="auth-page__benefit">
              <span className="auth-page__benefit-icon">
                <Recycle size={16} strokeWidth={2.4} />
              </span>
              <span>Salurkan surplus pangan lewat marketplace atau donasi.</span>
            </div>
            <div className="auth-page__benefit">
              <span className="auth-page__benefit-icon">
                <ShieldCheck size={16} strokeWidth={2.4} />
              </span>
              <span>Insight berbasis AI untuk keputusan operasional cepat.</span>
            </div>
          </div>
        </div>
        <p className="auth-page__legal">
          © {new Date().getFullYear()} F.R.E.S.H. Bersama mengurangi pemborosan pangan.
        </p>
      </aside>

      <main className="auth-page__form">
        <Link to="/" className="auth-back" aria-label="Kembali ke beranda">
          <ArrowLeft size={14} strokeWidth={2.6} />
          Kembali
        </Link>
        <div className="auth-card">
          <h2 className="auth-card__title">Masuk ke akun Anda</h2>
          <p className="auth-card__subtitle">
            Lanjutkan mengelola stok, scan AI, marketplace, dan donasi makanan
            dalam satu dashboard.
          </p>
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label htmlFor="login-email" className="auth-field__label">Alamat email</label>
              <div className="auth-input">
                <Mail size={18} strokeWidth={2.2} />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="contoh: nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="auth-field">
              <label htmlFor="login-password" className="auth-field__label">Password</label>
              <div className="auth-input">
                <Lock size={18} strokeWidth={2.2} />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="auth-input__icon-btn"
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <EyeOff size={18} strokeWidth={2.2} /> : <Eye size={18} strokeWidth={2.2} />}
                </button>
              </div>
            </div>
            <div className="auth-options">
              <Link to="/forgot-password">Lupa password?</Link>
            </div>
            <button type="submit" className="auth-btn-primary" disabled={loading}>
              {loading ? 'Memproses...' : 'Masuk Sekarang'}
              {!loading && <ArrowRight size={16} strokeWidth={2.6} />}
            </button>
            <div className="auth-divider">atau</div>
            <button
              type="button"
              className="auth-btn-google"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <GoogleIcon />
              Lanjutkan dengan Google
            </button>
          </form>
          <p className="auth-meta">
            Belum punya akun?
            <Link to="/register">Daftar gratis</Link>
          </p>
        </div>
      </main>
    </div>
  )
}
