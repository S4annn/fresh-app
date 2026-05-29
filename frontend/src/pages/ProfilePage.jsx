import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Mail,
  MapPin,
  Pencil,
  Trash2,
  UserRound,
  Loader2,
  ShieldCheck,
  Building2,
  Home,
  Save,
  X,
} from 'lucide-react'
import AppLayout from '../components/AppLayout'
import BusinessLayout from '../components/BusinessLayout'
import { useFeedback } from '../components/feedback/feedbackContext'
import { getProfile, updateProfile, deleteAccount, logout } from '../services/authService'
import '../styles/profile.css'

function readStoredUser() {
  try {
    const raw = localStorage.getItem('user')
    if (!raw || raw === 'undefined' || raw === 'null') return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const feedback = useFeedback()
  const [isEdit, setIsEdit] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [locating, setLocating] = useState(false)

  const [user, setUser] = useState(() => readStoredUser() || {
    name: 'Pengguna',
    email: '',
    address: '',
    latitude: '',
    longitude: '',
    image_url: '',
    role: 'pribadi',
  })

  // Form state — terpisah dari user supaya cancel tidak merusak data tampil
  const [form, setForm] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
  })

  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await getProfile()
        const merged = {
          ...profile,
          name: profile.name || profile.fullname || 'Pengguna',
        }
        localStorage.setItem('user', JSON.stringify(merged))
        setUser(merged)
      } catch (error) {
        console.error(error)
      }
    }
    loadProfile()
  }, [])

  function startEdit() {
    setForm({
      name: user.name || user.fullname || '',
      address: user.address || '',
      latitude: user.latitude || '',
      longitude: user.longitude || '',
    })
    setIsEdit(true)
  }

  function cancelEdit() {
    setIsEdit(false)
  }

  function handleFormChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  // Fallback: ambil lokasi via IP geolocation
  async function getLocationViaIP() {
    try {
      feedback.info('GPS tidak tersedia, mencoba lokasi berdasarkan IP...', { duration: 3000 })
      const response = await fetch('https://ipapi.co/json/')
      if (!response.ok) throw new Error('IP geolocation gagal')
      const data = await response.json()
      if (data.latitude && data.longitude) {
        const lat = parseFloat(data.latitude).toFixed(6)
        const lng = parseFloat(data.longitude).toFixed(6)
        setForm((prev) => ({ ...prev, latitude: lat, longitude: lng }))
        feedback.success(
          `Lokasi berhasil diambil (berdasarkan IP): ${data.city || 'Unknown'}, ${data.country_name || ''}`,
          { duration: 5000 }
        )
        return true
      }
      return false
    } catch (error) {
      console.error('IP geolocation error:', error)
      return false
    }
  }

  // Ambil lokasi via browser Geolocation API
  async function handleGetLocation() {
    if (!navigator.geolocation) {
      feedback.warning('Browser Anda tidak mendukung GPS. Mencoba lokasi berdasarkan IP...')
      setLocating(true)
      const success = await getLocationViaIP()
      setLocating(false)
      if (!success) {
        feedback.error('Gagal mengambil lokasi. Silakan masukkan koordinat secara manual.')
      }
      return
    }

    setLocating(true)
    
    // Feedback bertahap
    feedback.info('📍 Meminta izin lokasi dari browser...', { duration: 3000 })
    
    // Setelah 3 detik, kasih reminder
    const reminderTimeout = setTimeout(() => {
      if (locating) {
        feedback.info('⏳ Menunggu GPS... Pastikan Anda sudah klik "Izinkan" di popup browser', { duration: 5000 })
      }
    }, 3000)
    
    // Setelah 15 detik, kasih warning
    const warningTimeout = setTimeout(() => {
      if (locating) {
        feedback.warning('⚠️ GPS membutuhkan waktu lama. Jika gagal, sistem akan otomatis mencoba lokasi berdasarkan IP', { duration: 5000 })
      }
    }, 15000)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6)
        const lng = position.coords.longitude.toFixed(6)
        setForm((prev) => ({ ...prev, latitude: lat, longitude: lng }))
        feedback.success(`Lokasi GPS berhasil diambil: ${lat}, ${lng}`)
        setLocating(false)
      },
      async (err) => {
        console.error('Geolocation error:', err)
        if (err.code === 1) {
          // Permission denied
          feedback.warning(
            'Izin lokasi ditolak. Mencoba lokasi berdasarkan IP...',
            { duration: 4000 }
          )
          const success = await getLocationViaIP()
          setLocating(false)
          if (!success) {
            feedback.error(
              'Gagal mengambil lokasi. Untuk menggunakan GPS: Klik ikon gembok di address bar → Lokasi → Izinkan, lalu coba lagi.',
              { duration: 8000 }
            )
          }
        } else if (err.code === 2) {
          // Position unavailable
          feedback.warning('GPS tidak tersedia. Mencoba lokasi berdasarkan IP...')
          const success = await getLocationViaIP()
          setLocating(false)
          if (!success) {
            feedback.error('Lokasi tidak dapat ditemukan. Pastikan koneksi internet aktif atau masukkan koordinat manual.')
          }
        } else if (err.code === 3) {
          // Timeout
          feedback.warning('GPS timeout. Mencoba lokasi berdasarkan IP...')
          const success = await getLocationViaIP()
          setLocating(false)
          if (!success) {
            feedback.error('Waktu habis. Coba lagi atau masukkan koordinat secara manual.')
          }
        } else {
          setLocating(false)
          feedback.error('Gagal mengambil lokasi: ' + err.message)
        }
      },
      { 
        enableHighAccuracy: true, 
        timeout: 30000, // 30 detik
        maximumAge: 0 // Selalu ambil lokasi terbaru
      }
    )
  }

  async function handleSave() {
    if (!form.name.trim()) {
      feedback.warning('Nama tidak boleh kosong.')
      return
    }
    try {
      setSaving(true)
      // Kirim field 'name' ke backend (bukan 'fullname')
      const payload = {
        name: form.name.trim(),
        address: form.address.trim() || null,
        latitude: form.latitude || null,
        longitude: form.longitude || null,
      }
      const updated = await updateProfile(payload)
      const merged = {
        ...user,
        ...updated,
        name: updated.name || payload.name,
        fullname: updated.name || payload.name,
        address: updated.address ?? payload.address,
        latitude: updated.latitude ?? payload.latitude,
        longitude: updated.longitude ?? payload.longitude,
        image_url:
          updated.image_url ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(updated.name || payload.name)}`,
      }
      localStorage.setItem('user', JSON.stringify(merged))
      setUser(merged)
      setIsEdit(false)
      feedback.success('Profil berhasil disimpan.')
    } catch (error) {
      feedback.error(error.message || 'Gagal menyimpan profil.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteAccount() {
    const confirmed = await feedback.confirm({
      title: 'Hapus Akun',
      message:
        'Semua data Anda akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.',
      confirmLabel: 'Hapus Akun',
      cancelLabel: 'Batal',
    })
    if (!confirmed) return
    try {
      setDeleting(true)
      await deleteAccount()
      logout()
      navigate('/login', { replace: true })
    } catch (error) {
      feedback.error(error.message || 'Gagal menghapus akun.')
    } finally {
      setDeleting(false)
    }
  }

  const isBusiness =
    String(user.role || '').toLowerCase() === 'bisnis' ||
    String(user.role || '').toLowerCase() === 'business'

  const Layout = isBusiness ? BusinessLayout : AppLayout

  const displayName = user.name || user.fullname || 'Pengguna'
  const avatarUrl =
    user.image_url ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`

  const hasLocation = form.latitude && form.longitude
  const hasUserLocation = user.latitude && user.longitude

  return (
    <Layout title="PROFIL">
      <div className="profile-page">

        {/* HERO */}
        <section className="profile-hero">
          <div className="profile-hero__avatar">
            <img src={avatarUrl} alt={displayName} />
          </div>
          <div className="profile-hero__info">
            <h1 className="profile-hero__name">{displayName}</h1>
            <p className="profile-hero__email">{user.email || '-'}</p>
            <span className="profile-hero__badge">
              {isBusiness ? <Building2 size={13} strokeWidth={2.4} /> : <Home size={13} strokeWidth={2.4} />}
              {isBusiness ? 'Akun Bisnis' : 'Akun Pribadi'}
            </span>
          </div>
          {!isEdit && (
            <div className="profile-hero__actions">
              <button
                type="button"
                className="profile-hero__edit-btn"
                onClick={startEdit}
              >
                <Pencil size={15} strokeWidth={2.4} />
                Edit Profil
              </button>
            </div>
          )}
        </section>

        <div className="profile-grid">
          {/* INFO / FORM */}
          <div className="profile-card">
            <div className="profile-card__head">
              <span className="profile-card__head-icon">
                <UserRound size={18} strokeWidth={2.4} />
              </span>
              <div>
                <h3>{isEdit ? 'Edit Informasi' : 'Informasi Akun'}</h3>
                <small>{isEdit ? 'Ubah nama dan alamat Anda' : 'Data profil Anda'}</small>
              </div>
            </div>

            {isEdit ? (
              <div className="profile-form">
                <div className="profile-field">
                  <label htmlFor="pf-name">Nama Lengkap</label>
                  <input
                    id="pf-name"
                    type="text"
                    name="name"
                    className="profile-input"
                    value={form.name}
                    onChange={handleFormChange}
                    placeholder="Nama lengkap Anda"
                    autoFocus
                  />
                </div>

                <div className="profile-field">
                  <label htmlFor="pf-email">Email</label>
                  <input
                    id="pf-email"
                    type="email"
                    className="profile-input"
                    value={user.email || ''}
                    disabled
                    title="Email tidak dapat diubah"
                  />
                </div>

                <div className="profile-field">
                  <label htmlFor="pf-address">Alamat</label>
                  <textarea
                    id="pf-address"
                    name="address"
                    className="profile-textarea"
                    value={form.address}
                    onChange={handleFormChange}
                    placeholder="Alamat lengkap Anda (opsional)"
                  />
                </div>

                {/* Lokasi */}
                <div className="profile-location-box">
                  <span className="profile-location-box__title">
                    <MapPin />
                    Lokasi (untuk marketplace & donasi)
                  </span>

                  {hasLocation && (
                    <div className="profile-map-preview">
                      <iframe
                        title="Pratinjau lokasi"
                        src={`https://www.google.com/maps?q=${form.latitude},${form.longitude}&output=embed`}
                        allowFullScreen
                        loading="lazy"
                      />
                    </div>
                  )}

                  <button
                    type="button"
                    className="profile-location-btn"
                    onClick={handleGetLocation}
                    disabled={locating}
                  >
                    {locating ? (
                      <>
                        <Loader2 size={16} strokeWidth={2.4} className="spinning" />
                        Mengambil lokasi...
                      </>
                    ) : (
                      <>
                        <MapPin size={16} strokeWidth={2.4} />
                        {hasLocation ? 'Perbarui Lokasi Otomatis' : 'Ambil Lokasi Otomatis'}
                      </>
                    )}
                  </button>

                  {/* Instruksi untuk user */}
                  <div style={{ 
                    marginTop: 12,
                    padding: '12px 16px',
                    background: 'var(--color-bg-soft)',
                    borderRadius: 8,
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: 'var(--color-text-soft)'
                  }}>
                    <strong style={{ display: 'block', marginBottom: 6, color: 'var(--color-text)' }}>
                      💡 Tips mengambil lokasi:
                    </strong>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      <li>Klik tombol "Ambil Lokasi Otomatis" di atas</li>
                      <li>Browser akan meminta izin — <strong>klik "Izinkan"</strong></li>
                      <li>Tunggu hingga 30 detik untuk GPS</li>
                      <li>Jika GPS gagal, sistem akan otomatis mencoba lokasi berdasarkan IP</li>
                      <li>Atau masukkan koordinat manual di bawah</li>
                    </ul>
                  </div>

                  <div style={{ 
                    marginTop: 16, 
                    paddingTop: 16, 
                    borderTop: '1px solid var(--color-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-soft)' }}>
                      Atau masukkan koordinat manual:
                    </span>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div className="profile-field" style={{ marginBottom: 0 }}>
                        <label htmlFor="pf-lat" style={{ fontSize: 12 }}>Latitude</label>
                        <input
                          id="pf-lat"
                          type="text"
                          name="latitude"
                          className="profile-input"
                          value={form.latitude}
                          onChange={handleFormChange}
                          placeholder="-6.200000"
                          style={{ fontSize: 13 }}
                        />
                      </div>
                      <div className="profile-field" style={{ marginBottom: 0 }}>
                        <label htmlFor="pf-lng" style={{ fontSize: 12 }}>Longitude</label>
                        <input
                          id="pf-lng"
                          type="text"
                          name="longitude"
                          className="profile-input"
                          value={form.longitude}
                          onChange={handleFormChange}
                          placeholder="106.816666"
                          style={{ fontSize: 13 }}
                        />
                      </div>
                    </div>
                    <small style={{ fontSize: 11, color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                      💡 Tip: Buka Google Maps, klik kanan pada lokasi Anda, lalu salin koordinat yang muncul.
                    </small>
                  </div>
                </div>

                <div className="profile-form-actions">
                  <button
                    type="button"
                    className="profile-btn-cancel"
                    onClick={cancelEdit}
                    disabled={saving}
                  >
                    <X size={15} strokeWidth={2.6} />
                    Batal
                  </button>
                  <button
                    type="button"
                    className="profile-btn-save"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 size={15} strokeWidth={2.4} className="spinning" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save size={15} strokeWidth={2.4} />
                        Simpan Perubahan
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="profile-info-list">
                <div className="profile-info-row">
                  <span className="profile-info-row__icon">
                    <UserRound size={17} strokeWidth={2.2} />
                  </span>
                  <div className="profile-info-row__body">
                    <div className="profile-info-row__label">Nama Lengkap</div>
                    <div className="profile-info-row__value">{displayName}</div>
                  </div>
                </div>

                <div className="profile-info-row">
                  <span className="profile-info-row__icon">
                    <Mail size={17} strokeWidth={2.2} />
                  </span>
                  <div className="profile-info-row__body">
                    <div className="profile-info-row__label">Email</div>
                    <div className="profile-info-row__value">{user.email || '-'}</div>
                  </div>
                </div>

                <div className="profile-info-row">
                  <span className="profile-info-row__icon">
                    <MapPin size={17} strokeWidth={2.2} />
                  </span>
                  <div className="profile-info-row__body">
                    <div className="profile-info-row__label">Alamat</div>
                    <div className={`profile-info-row__value${!user.address ? ' profile-info-row__value--muted' : ''}`}>
                      {user.address || 'Belum diisi'}
                    </div>
                  </div>
                </div>

                <div className="profile-info-row">
                  <span className="profile-info-row__icon">
                    <ShieldCheck size={17} strokeWidth={2.2} />
                  </span>
                  <div className="profile-info-row__body">
                    <div className="profile-info-row__label">Status Akun</div>
                    <div className="profile-info-row__value">
                      {user.is_verified ? '✅ Terverifikasi' : '⏳ Belum terverifikasi'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* LOKASI VIEW (saat tidak edit) */}
          {!isEdit && (
            <div className="profile-card">
              <div className="profile-card__head">
                <span className="profile-card__head-icon">
                  <MapPin size={18} strokeWidth={2.4} />
                </span>
                <div>
                  <h3>Lokasi</h3>
                  <small>Digunakan untuk marketplace & donasi terdekat</small>
                </div>
              </div>

              {hasUserLocation ? (
                <>
                  <div className="profile-location-box" style={{ marginBottom: 12 }}>
                    <div className="profile-location-box__coords">
                      <div className="profile-location-box__coord">
                        <span>Latitude</span>
                        <strong>{user.latitude}</strong>
                      </div>
                      <div className="profile-location-box__coord">
                        <span>Longitude</span>
                        <strong>{user.longitude}</strong>
                      </div>
                    </div>
                  </div>
                  <div className="profile-map-preview">
                    <iframe
                      title="Lokasi profil"
                      src={`https://www.google.com/maps?q=${user.latitude},${user.longitude}&output=embed`}
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                </>
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  padding: '32px 16px',
                  textAlign: 'center',
                  border: '1.5px dashed var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-surface-soft)',
                }}>
                  <MapPin size={32} strokeWidth={1.5} color="var(--color-text-soft)" />
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)' }}>
                    Lokasi belum diatur
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--color-text-muted)', maxWidth: 240 }}>
                    Klik "Edit Profil" lalu "Ambil Lokasi Saya" agar bisa melihat marketplace dan donasi terdekat.
                  </span>
                  <button
                    type="button"
                    className="profile-hero__edit-btn"
                    style={{ marginTop: 4, background: 'var(--color-primary-50)', color: 'var(--color-primary-800)', boxShadow: 'none' }}
                    onClick={startEdit}
                  >
                    <MapPin size={14} strokeWidth={2.4} />
                    Atur Lokasi
                  </button>
                </div>
              )}
            </div>
          )}

          {/* DANGER ZONE */}
          {!isEdit && (
            <div className="profile-danger-zone profile-card--full">
              <div className="profile-danger-zone__title">Zona Berbahaya</div>
              <div className="profile-danger-zone__desc">
                Menghapus akun akan menghapus semua data Anda secara permanen termasuk inventaris,
                donasi, dan riwayat transaksi. Tindakan ini tidak dapat dibatalkan.
              </div>
              <button
                type="button"
                className="profile-btn-delete"
                onClick={handleDeleteAccount}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <Loader2 size={15} strokeWidth={2.4} className="spinning" />
                    Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 size={15} strokeWidth={2.4} />
                    Hapus Akun Saya
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
