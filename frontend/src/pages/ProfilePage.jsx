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
import LocationPicker from '../components/LocationPicker'
import FreshMap from '../components/FreshMap'
import { useFeedback } from '../components/feedback/feedbackContext'
import { getProfile, updateProfile, deleteAccount, logout, saveUserLocationToServer } from '../services/authService'
import { saveUserLocation } from '../utils/geo'
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

  const [user, setUser] = useState(() => readStoredUser() || {
    name: 'Pengguna',
    email: '',
    address: '',
    location_name: '',
    latitude: null,
    longitude: null,
    image_url: '',
    role: 'pribadi',
  })

  // Form state
  const [form, setForm] = useState({
    name: '',
    address: '',
    location: null, // {location_name, latitude, longitude}
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
    const location = user.latitude && user.longitude
      ? {
          location_name: user.location_name || `${user.latitude}, ${user.longitude}`,
          latitude: parseFloat(user.latitude),
          longitude: parseFloat(user.longitude),
        }
      : null

    setForm({
      name: user.name || user.fullname || '',
      address: user.address || '',
      location,
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

  function handleLocationChange(location) {
    setForm((prev) => ({ ...prev, location }))
  }

  async function handleSave() {
    if (!form.name.trim()) {
      feedback.warning('Nama tidak boleh kosong.')
      return
    }
    try {
      setSaving(true)
      const payload = {
        name: form.name.trim(),
        address: form.address.trim() || null,
        location_name: form.location?.location_name || null,
        latitude: form.location?.latitude || null,
        longitude: form.location?.longitude || null,
      }
      const updated = await updateProfile(payload)
      const merged = {
        ...user,
        ...updated,
        name: updated.name || payload.name,
        fullname: updated.name || payload.name,
        address: updated.address ?? payload.address,
        location_name: updated.location_name ?? payload.location_name,
        latitude: updated.latitude ?? payload.latitude,
        longitude: updated.longitude ?? payload.longitude,
        image_url:
          updated.image_url ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(updated.name || payload.name)}`,
      }
      localStorage.setItem('user', JSON.stringify(merged))
      setUser(merged)

      // Simpan lokasi ke localStorage untuk digunakan di marketplace/donation
      if (form.location) {
        saveUserLocation(form.location)
        // Juga simpan ke server (fire-and-forget, tidak block UI)
        saveUserLocationToServer(form.location).catch(console.error)
      }

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

  const hasUserLocation = user.latitude && user.longitude
  const userLocationForMap = hasUserLocation
    ? {
        latitude: parseFloat(user.latitude),
        longitude: parseFloat(user.longitude),
        location_name: user.location_name || '',
      }
    : null

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
                <small>{isEdit ? 'Ubah nama, alamat, dan lokasi Anda' : 'Data profil Anda'}</small>
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

                {/* Location Picker Component */}
                <LocationPicker
                  value={form.location}
                  onChange={handleLocationChange}
                  label="Lokasi"
                  placeholder="Cari lokasi atau gunakan lokasi saat ini"
                  countryCode="id"
                />

                {/* Map Preview */}
                {form.location && form.location.latitude && form.location.longitude && (
                  <div style={{ marginTop: 16 }}>
                    <FreshMap
                      userLocation={form.location}
                      listings={[]}
                      height={300}
                      showRadius={false}
                    />
                  </div>
                )}

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

                {hasUserLocation && (
                  <div className="profile-info-row">
                    <span className="profile-info-row__icon">
                      <MapPin size={17} strokeWidth={2.2} />
                    </span>
                    <div className="profile-info-row__body">
                      <div className="profile-info-row__label">Lokasi</div>
                      <div className="profile-info-row__value">
                        {user.location_name || `${user.latitude}, ${user.longitude}`}
                      </div>
                    </div>
                  </div>
                )}

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

          {/* MAP VIEW (saat tidak edit) */}
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
                <FreshMap
                  userLocation={userLocationForMap}
                  listings={[]}
                  height={350}
                  showRadius={true}
                  radiusKm={10}
                />
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
                    Klik "Edit Profil" lalu gunakan LocationPicker untuk mengatur lokasi Anda.
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
