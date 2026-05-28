import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Mail, MailCheck, RefreshCw, Sparkles, ShieldCheck, Recycle, Leaf } from 'lucide-react'
import { resendOtp, verifyOtp } from '../services/authService'
import { useFeedback } from '../components/feedback/feedbackContext'
import logo from '../assets/images/logo.png'
import '../styles/auth.css'

const OTP_LENGTH = 6

export default function VerifyOtpPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const feedback = useFeedback()
  const emailFromState = location.state?.email || ''
  const [email, setEmail] = useState(emailFromState)
  const [digits, setDigits] = useState(() => Array(OTP_LENGTH).fill(''))
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const inputsRef = useRef([])

  useEffect(() => {
    if (resendCooldown <= 0) return undefined
    const timer = setTimeout(() => setResendCooldown((v) => v - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendCooldown])

  function handleDigitChange(index, value) {
    const sanitized = value.replace(/\D/g, '').slice(0, 1)
    setDigits((prev) => {
      const next = [...prev]
      next[index] = sanitized
      return next
    })
    if (sanitized && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index, e) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowLeft' && index > 0) inputsRef.current[index - 1]?.focus()
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) inputsRef.current[index + 1]?.focus()
  }

  function handlePaste(e) {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (!text) return
    e.preventDefault()
    const next = Array(OTP_LENGTH).fill('')
    text.split('').forEach((digit, idx) => { next[idx] = digit })
    setDigits(next)
    const nextFocus = Math.min(text.length, OTP_LENGTH - 1)
    inputsRef.current[nextFocus]?.focus()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email) return feedback.warning('Silakan masukkan email terlebih dahulu.')
    const otpCode = digits.join('')
    if (otpCode.length !== OTP_LENGTH) return feedback.warning('Kode OTP harus 6 digit.')
    try {
      setLoading(true)
      await verifyOtp({ email, otpCode })
      feedback.success('Verifikasi berhasil. Silakan masuk.')
      navigate('/login', { replace: true })
    } catch (error) {
      feedback.error(error.message || 'Verifikasi OTP gagal.', { title: 'OTP tidak valid' })
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    if (!email) return feedback.warning('Masukkan email untuk menerima OTP baru.')
    if (resendCooldown > 0) return
    try {
      setResending(true)
      await resendOtp(email)
      feedback.success('Kode OTP baru telah dikirim ke email Anda.')
      setResendCooldown(45)
    } catch (error) {
      feedback.error(error.message || 'Gagal mengirim ulang OTP.')
    } finally {
      setResending(false)
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
            Selangkah lagi
          </span>
          <h2>
            Verifikasi email untuk <span>mengamankan</span> akun Anda.
          </h2>
          <p>
            Kami sudah mengirim kode 6 digit ke email Anda. Masukkan kode untuk
            mengaktifkan dashboard pengelolaan pangan F.R.E.S.H.
          </p>
          <div className="auth-page__benefits">
            <div className="auth-page__benefit">
              <span className="auth-page__benefit-icon"><ShieldCheck size={16} strokeWidth={2.4} /></span>
              <span>Verifikasi dua tahap melindungi data Anda.</span>
            </div>
            <div className="auth-page__benefit">
              <span className="auth-page__benefit-icon"><Leaf size={16} strokeWidth={2.4} /></span>
              <span>Akses dasbor inventaris cerdas usai verifikasi.</span>
            </div>
            <div className="auth-page__benefit">
              <span className="auth-page__benefit-icon"><Recycle size={16} strokeWidth={2.4} /></span>
              <span>Marketplace dan donasi siap menerima surplus Anda.</span>
            </div>
          </div>
        </div>
        <p className="auth-page__legal">
          Tidak menerima email? Periksa folder spam atau kirim ulang kode.
        </p>
      </aside>

      <main className="auth-page__form">
        <div className="auth-card">
          <h2 className="auth-card__title">Verifikasi OTP</h2>
          <p className="auth-card__subtitle">
            Masukkan 6 digit kode yang kami kirim ke{' '}
            <strong>{email || 'email Anda'}</strong>.
          </p>
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label className="auth-field__label" htmlFor="otp-email">Email</label>
              <div className="auth-input">
                <Mail size={18} strokeWidth={2.2} />
                <input
                  id="otp-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contoh: nama@email.com"
                  required
                />
              </div>
            </div>
            <div className="auth-field">
              <span className="auth-field__label">Kode OTP</span>
              <div className="auth-otp-grid" onPaste={handlePaste}>
                {digits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputsRef.current[index] = el }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    aria-label={`OTP digit ${index + 1}`}
                  />
                ))}
              </div>
            </div>
            <button type="submit" className="auth-btn-primary" disabled={loading}>
              <MailCheck size={18} strokeWidth={2.4} />
              {loading ? 'Memverifikasi...' : 'Verifikasi OTP'}
            </button>
            <button
              type="button"
              className="auth-btn-secondary"
              onClick={handleResend}
              disabled={resending || resendCooldown > 0}
            >
              <RefreshCw size={18} strokeWidth={2.4} />
              {resendCooldown > 0
                ? `Kirim Ulang dalam ${resendCooldown}s`
                : resending
                  ? 'Mengirim...'
                  : 'Kirim Ulang OTP'}
            </button>
          </form>
          <p className="auth-meta">
            Sudah verifikasi?
            <Link to="/login">Masuk sekarang</Link>
          </p>
        </div>
      </main>
    </div>
  )
}
