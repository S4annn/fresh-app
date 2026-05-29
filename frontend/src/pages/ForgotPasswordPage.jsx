import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Send, ArrowLeft, ShieldCheck, Sparkles, Leaf, Recycle } from 'lucide-react'
import { forgotPassword } from '../services/authService'
import { useFeedback } from '../components/feedback/feedbackContext'
import logo from '../assets/images/logo.png'
import '../styles/auth.css'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const feedback = useFeedback()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim()) return feedback.warning('Email wajib diisi.')
    try {
      setLoading(true)
      const cleanEmail = email.trim().toLowerCase()
      await forgotPassword(cleanEmail)
      feedback.success('Jika email terdaftar, instruksi reset password telah dikirim.')
      navigate('/reset-password', { state: { email: cleanEmail } })
    } catch (error) {
      feedback.error(error.message || 'Gagal mengirim kode reset password.', {
        title: 'Reset gagal',
      })
    } finally {
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
            Akun Anda aman
          </span>
          <h2>
            Atur ulang password <span>tanpa khawatir</span>.
          </h2>
          <p>
            Masukkan email Anda, kami akan kirim kode verifikasi untuk
            mengamankan proses reset password.
          </p>
          <div className="auth-page__benefits">
            <div className="auth-page__benefit">
              <span className="auth-page__benefit-icon">
                <ShieldCheck size={16} strokeWidth={2.4} />
              </span>
              <span>OTP enam digit memastikan permintaan reset valid.</span>
            </div>
            <div className="auth-page__benefit">
              <span className="auth-page__benefit-icon">
                <Leaf size={16} strokeWidth={2.4} />
              </span>
              <span>Inventory dan donasi tetap aman saat akun di-reset.</span>
            </div>
            <div className="auth-page__benefit">
              <span className="auth-page__benefit-icon">
                <Recycle size={16} strokeWidth={2.4} />
              </span>
              <span>Tidak ada data pribadi yang dibagikan ke pihak ketiga.</span>
            </div>
          </div>
        </div>
        <p className="auth-page__legal">
          Butuh bantuan lain? Hubungi support kami melalui fresh@email.com.
        </p>
      </aside>

      <main className="auth-page__form">
        <div className="auth-card">
          <h2 className="auth-card__title">Lupa password?</h2>
          <p className="auth-card__subtitle">
            Masukkan email yang terdaftar dan kami akan mengirimkan kode
            verifikasi.
          </p>
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label className="auth-field__label" htmlFor="forgot-email">Alamat email</label>
              <div className="auth-input">
                <Mail size={18} strokeWidth={2.2} />
                <input
                  id="forgot-email"
                  type="email"
                  placeholder="contoh: nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <button type="submit" className="auth-btn-primary" disabled={loading}>
              <Send size={18} strokeWidth={2.4} />
              {loading ? 'Mengirim kode...' : 'Kirim Kode Reset'}
            </button>
            <Link to="/login" className="auth-btn-secondary">
              <ArrowLeft size={18} strokeWidth={2.4} />
              Kembali ke Login
            </Link>
          </form>
        </div>
      </main>
    </div>
  )
}
