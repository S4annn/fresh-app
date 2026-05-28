import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Mail,
  Lock,
  KeyRound,
  ArrowLeft,
  CheckCircle,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  Leaf,
  Recycle,
} from 'lucide-react'
import { resetPassword } from '../services/authService'
import { useFeedback } from '../components/feedback/feedbackContext'
import logo from '../assets/images/logo.png'
import '../styles/auth.css'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const feedback = useFeedback()
  const emailFromForgot = location.state?.email || ''
  const [form, setForm] = useState({
    email: emailFromForgot,
    otpCode: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: name === 'otpCode' ? value.replace(/\D/g, '').slice(0, 6) : value,
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.email.trim()) return feedback.warning('Email wajib diisi.')
    if (form.otpCode.length !== 6) return feedback.warning('Kode OTP harus 6 digit.')
    if (form.newPassword.length < 6) return feedback.warning('Password baru minimal 6 karakter.')
    if (form.newPassword !== form.confirmPassword) {
      return feedback.error('Konfirmasi password tidak sama.')
    }
    try {
      setLoading(true)
      await resetPassword({
        email: form.email.trim().toLowerCase(),
        otpCode: form.otpCode,
        newPassword: form.newPassword,
      })
      feedback.success('Password berhasil direset. Silakan masuk dengan password baru.')
      navigate('/login', { replace: true })
    } catch (error) {
      feedback.error(error.message || 'Reset password gagal.', { title: 'Reset gagal' })
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
            Hampir selesai
          </span>
          <h2>
            Buat password baru yang <span>lebih kuat</span>.
          </h2>
          <p>
            Masukkan kode OTP dari email, lalu pilih password baru yang mudah
            Anda ingat tetapi sulit ditebak.
          </p>
          <div className="auth-page__benefits">
            <div className="auth-page__benefit">
              <span className="auth-page__benefit-icon"><ShieldCheck size={16} strokeWidth={2.4} /></span>
              <span>Password disimpan dengan enkripsi industri.</span>
            </div>
            <div className="auth-page__benefit">
              <span className="auth-page__benefit-icon"><Leaf size={16} strokeWidth={2.4} /></span>
              <span>Akses dasbor pengelolaan pangan tetap berjalan tanpa gangguan.</span>
            </div>
            <div className="auth-page__benefit">
              <span className="auth-page__benefit-icon"><Recycle size={16} strokeWidth={2.4} /></span>
              <span>Marketplace dan donasi tetap aktif setelah reset.</span>
            </div>
          </div>
        </div>
        <p className="auth-page__legal">
          Tips: gunakan minimal 8 karakter dengan kombinasi huruf, angka, dan simbol.
        </p>
      </aside>

      <main className="auth-page__form">
        <div className="auth-card">
          <h2 className="auth-card__title">Reset password</h2>
          <p className="auth-card__subtitle">
            Masukkan kode dari email lalu buat password baru.
          </p>
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label className="auth-field__label" htmlFor="reset-email">Email</label>
              <div className="auth-input">
                <Mail size={18} strokeWidth={2.2} />
                <input
                  id="reset-email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="contoh: nama@email.com"
                  required
                />
              </div>
            </div>
            <div className="auth-field">
              <label className="auth-field__label" htmlFor="reset-otp">Kode OTP</label>
              <div className="auth-input">
                <KeyRound size={18} strokeWidth={2.2} />
                <input
                  id="reset-otp"
                  name="otpCode"
                  type="text"
                  inputMode="numeric"
                  placeholder="Masukkan 6 digit OTP"
                  value={form.otpCode}
                  onChange={handleChange}
                  maxLength={6}
                  required
                />
              </div>
            </div>
            <div className="auth-field">
              <label className="auth-field__label" htmlFor="reset-password">Password baru</label>
              <div className="auth-input">
                <Lock size={18} strokeWidth={2.2} />
                <input
                  id="reset-password"
                  name="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 6 karakter"
                  value={form.newPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="auth-input__icon-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label="Tampilkan password"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="auth-field">
              <label className="auth-field__label" htmlFor="reset-confirm">Konfirmasi password</label>
              <div className="auth-input">
                <Lock size={18} strokeWidth={2.2} />
                <input
                  id="reset-confirm"
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Ulangi password baru"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="auth-input__icon-btn"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label="Tampilkan konfirmasi password"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" className="auth-btn-primary" disabled={loading}>
              <CheckCircle size={18} strokeWidth={2.4} />
              {loading ? 'Memproses...' : 'Reset Password'}
            </button>
            <Link to="/forgot-password" className="auth-btn-secondary">
              <ArrowLeft size={18} strokeWidth={2.4} />
              Kembali
            </Link>
          </form>
        </div>
      </main>
    </div>
  )
}
