import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  MapPin,
  LocateFixed,
  Leaf,
  Sparkles,
  Recycle,
  ShieldCheck,
  Building2,
  Home,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react'
import { register } from '../services/authService'
import { useFeedback } from '../components/feedback/feedbackContext'
import logo from '../assets/images/logo.png'
import '../styles/auth.css'

const initialForm = {
  fullname: '',
  email: '',
  password: '',
  confirmPassword: '',
  address: '',
  latitude: '',
  longitude: '',
  role: 'pribadi',
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const feedback = useFeedback()
  const [form, setForm] = useState(initialForm)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleRoleChange(role) {
    setForm((prev) => ({ ...prev, role }))
  }

  function getCurrentLocation() {
    if (!navigator.geolocation) {
      feedback.error('Browser Anda tidak mendukung geolokasi.')
      return
    }
    feedback.info('Mengambil lokasi Anda...', { duration: 2000 })
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        }))
        feedback.success('Lokasi berhasil ditambahkan.')
      },
      (err) => {
        if (err.code === 1) {
          feedback.error(
            'Izin lokasi ditolak. Klik ikon gembok di address bar → Lokasi → Izinkan, lalu refresh.',
            { duration: 7000 }
          )
        } else if (err.code === 2) {
          feedback.error('Lokasi tidak tersedia. Pastikan koneksi internet aktif.')
        } else if (err.code === 3) {
          feedback.error('Waktu habis. Pastikan izin lokasi sudah diaktifkan, lalu coba lagi.')
        } else {
          feedback.error('Gagal mengambil lokasi. Pastikan izin lokasi diaktifkan.')
        }
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.fullname.trim()) return feedback.warning('Nama lengkap wajib diisi.')
    if (form.password.length < 6) return feedback.warning('Password minimal 6 karakter.')
    if (form.password !== form.confirmPassword) {
      return feedback.error('Password dan konfirmasi tidak sama.')
    }
    try {
      setLoading(true)
      await register({
        name: form.fullname.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password.trim(),
        confirmPassword: form.confirmPassword.trim(),
        address: form.address.trim(),
        latitude: form.latitude || null,
        longitude: form.longitude || null,
        role: form.role,
      })
      feedback.success('Kode OTP terkirim. Silakan cek email Anda.')
      navigate('/verify-otp', {
        replace: true,
        state: { email: form.email.trim().toLowerCase() },
      })
    } catch (error) {
      feedback.error(error.message || 'Pendaftaran gagal.', {
        title: 'Pendaftaran gagal',
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
            Mulai gratis kapan saja
          </span>
          <h2>
            Bergabung dan ubah <span>surplus pangan</span> jadi peluang.
          </h2>
          <p>
            Daftar sebagai pengguna pribadi untuk mengelola dapur Anda, atau
            sebagai bisnis untuk menjual surplus dan menjangkau pembeli baru.
          </p>
          <div className="auth-page__benefits">
            <div className="auth-page__benefit">
              <span className="auth-page__benefit-icon">
                <Leaf size={16} strokeWidth={2.4} />
              </span>
              <span>Inventaris cerdas dengan prediksi risiko kedaluwarsa.</span>
            </div>
            <div className="auth-page__benefit">
              <span className="auth-page__benefit-icon">
                <Recycle size={16} strokeWidth={2.4} />
              </span>
              <span>Marketplace surplus dan donasi terhubung dalam satu sistem.</span>
            </div>
            <div className="auth-page__benefit">
              <span className="auth-page__benefit-icon">
                <ShieldCheck size={16} strokeWidth={2.4} />
              </span>
              <span>Verifikasi OTP melindungi akun Anda dari awal.</span>
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
          <h2 className="auth-card__title">Buat akun baru</h2>
          <p className="auth-card__subtitle">
            Pilih jenis akun, isi data, dan langsung mulai mengelola pangan
            dengan F.R.E.S.H.
          </p>
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <span className="auth-field__label">Daftar sebagai</span>
              <div className="auth-radio-group">
                <label className={`auth-radio ${form.role === 'pribadi' ? 'is-active' : ''}`}>
                  <input
                    type="radio"
                    name="role"
                    value="pribadi"
                    checked={form.role === 'pribadi'}
                    onChange={() => handleRoleChange('pribadi')}
                  />
                  <span className="auth-radio__dot" aria-hidden="true" />
                  <Home size={18} strokeWidth={2.2} />
                  <div>
                    <strong>Pribadi</strong>
                    <span>Untuk rumah tangga</span>
                  </div>
                </label>
                <label className={`auth-radio ${form.role === 'bisnis' ? 'is-active' : ''}`}>
                  <input
                    type="radio"
                    name="role"
                    value="bisnis"
                    checked={form.role === 'bisnis'}
                    onChange={() => handleRoleChange('bisnis')}
                  />
                  <span className="auth-radio__dot" aria-hidden="true" />
                  <Building2 size={18} strokeWidth={2.2} />
                  <div>
                    <strong>Bisnis</strong>
                    <span>Restoran, kafe, UMKM</span>
                  </div>
                </label>
              </div>
            </div>
            <div className="auth-field">
              <label className="auth-field__label" htmlFor="reg-name">
                {form.role === 'bisnis' ? 'Nama toko / brand' : 'Nama lengkap'}
              </label>
              <div className="auth-input">
                <User size={18} strokeWidth={2.2} />
                <input
                  id="reg-name"
                  name="fullname"
                  type="text"
                  placeholder={form.role === 'bisnis' ? 'Contoh: Dapur Hijau Catering' : 'Contoh: Andi Saputra'}
                  value={form.fullname}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="auth-field">
              <label className="auth-field__label" htmlFor="reg-email">Alamat email</label>
              <div className="auth-input">
                <Mail size={18} strokeWidth={2.2} />
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  placeholder="contoh: nama@email.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="auth-form__row">
              <div className="auth-field">
                <label className="auth-field__label" htmlFor="reg-password">Password</label>
                <div className="auth-input">
                  <Lock size={18} strokeWidth={2.2} />
                  <input
                    id="reg-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 6 karakter"
                    value={form.password}
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
                <label className="auth-field__label" htmlFor="reg-confirm">Konfirmasi password</label>
                <div className="auth-input">
                  <Lock size={18} strokeWidth={2.2} />
                  <input
                    id="reg-confirm"
                    name="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Ulangi password"
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
            </div>
            <div className="auth-field">
              <label className="auth-field__label" htmlFor="reg-address">
                Alamat <span className="auth-field__hint">(opsional)</span>
              </label>
              <div className="auth-input auth-input--textarea">
                <MapPin size={18} strokeWidth={2.2} />
                <textarea
                  id="reg-address"
                  name="address"
                  placeholder="Alamat lengkap untuk pengiriman atau penjemputan donasi"
                  value={form.address}
                  onChange={handleChange}
                  rows={2}
                />
              </div>
            </div>
            <div className="auth-form__row">
              <div className="auth-field">
                <label className="auth-field__label" htmlFor="reg-lat">Latitude</label>
                <div className="auth-input">
                  <input
                    id="reg-lat"
                    name="latitude"
                    type="text"
                    placeholder="-6.20"
                    value={form.latitude}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="auth-field">
                <label className="auth-field__label" htmlFor="reg-lng">Longitude</label>
                <div className="auth-input">
                  <input
                    id="reg-lng"
                    name="longitude"
                    type="text"
                    placeholder="106.81"
                    value={form.longitude}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={getCurrentLocation}
              className="auth-btn-secondary"
            >
              <LocateFixed size={18} strokeWidth={2.2} />
              Gunakan Lokasi Saya
            </button>
            {form.latitude && form.longitude && (
              <iframe
                title="Pratinjau lokasi"
                className="auth-map"
                src={`https://www.google.com/maps?q=${form.latitude},${form.longitude}&output=embed`}
                allowFullScreen
                loading="lazy"
              />
            )}
            <button type="submit" className="auth-btn-primary" disabled={loading}>
              {loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
              {!loading && <ArrowRight size={16} strokeWidth={2.6} />}
            </button>
          </form>
          <p className="auth-meta">
            Sudah punya akun?
            <Link to="/login">Masuk</Link>
          </p>
        </div>
      </main>
    </div>
  )
}
