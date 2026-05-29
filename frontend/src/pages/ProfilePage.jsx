import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, MapPin, Pencil, Trash2, UserRound } from 'lucide-react'
import AppLayout from '../components/AppLayout'
import BusinessLayout from '../components/BusinessLayout'
import { getProfile, updateProfile, deleteAccount, logout } from '../services/authService'
import '../styles/profile.css'

export default function ProfilePage() {
  const navigate = useNavigate()
  const [isEdit, setIsEdit] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [user, setUser] = useState(() => {
    try {
      const savedUser = JSON.parse(
        localStorage.getItem('user')
      )
      return (
        savedUser || {
          fullname: 'User',
          name: 'User',
          email: '',
          address: '',
          latitude: '',
          longitude: '',
          image_url: '',
          role: 'personal',
        }
      )
    } catch {
      return {
        fullname: 'User',
        name: 'User',
        email: '',
        address: '',
        latitude: '',
        longitude: '',
        image_url: '',
        role: 'personal',
      }
    }
  })

  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await getProfile()
        const updatedUser = {
          ...profile,
          fullname:
            profile.fullname ||
            profile.name ||
            'User',
          name:
            profile.name ||
            profile.fullname ||
            'User',
          address:
            profile.address || '',
          latitude:
            profile.latitude || '',
          longitude:
            profile.longitude || '',
          image_url:
            profile.image_url ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
              profile.name || 'User'
            )}`,
        }
        localStorage.setItem(
          'user',
          JSON.stringify(updatedUser)
        )
        setUser(updatedUser)
      } catch (error) {
        console.error(error)
      }
    }
    loadProfile()
  }, [])

  const role = String(
    user.role ||
      localStorage.getItem('role') ||
      'personal'
  ).toLowerCase()

  const isBusiness =
    role === 'business' ||
    role === 'bisnis' ||
    role === 'seller'

  const Layout = isBusiness
    ? BusinessLayout
    : AppLayout

  function handleInputChange(e) {
    const { name, value } = e.target
    setUser((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const [gettingLocation, setGettingLocation] = useState(false)

  function getCurrentLocation() {
    return new Promise((resolve) => {
      if (!window.isSecureContext) {
        alert('Fitur lokasi hanya berfungsi di HTTPS atau localhost. Pastikan Anda mengakses melalui HTTPS.')
        resolve({
          latitude: '',
          longitude: '',
        })
        return
      }

      if (!navigator.geolocation) {
<<<<<<< HEAD
        alert('Browser Anda tidak mendukung geolokasi.')
        resolve({ latitude: '', longitude: '' })
=======
        alert('Browser tidak mendukung fitur geolokasi')
        resolve({
          latitude: '',
          longitude: '',
        })
>>>>>>> 1ca02f4 (fix bug location)
        return
      }

      // Pakai low accuracy dulu (WiFi/IP) — lebih cepat & bekerja di desktop
      // tanpa GPS hardware. maximumAge:60000 izinkan cache 1 menit.
      const options = {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 60000,
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6),
          })
        },
<<<<<<< HEAD
        (err) => {
          if (err.code === 1) {
            alert(
              'Izin lokasi ditolak.\n\nCara mengaktifkan:\n1. Klik ikon gembok/info di address bar browser\n2. Cari "Lokasi" → pilih "Izinkan"\n3. Refresh halaman dan coba lagi.'
            )
          } else if (err.code === 2) {
            alert('Lokasi tidak tersedia. Pastikan koneksi internet aktif.')
          } else if (err.code === 3) {
            alert('Waktu habis. Pastikan izin lokasi sudah diaktifkan di browser, lalu coba lagi.')
          } else {
            alert('Gagal mengambil lokasi: ' + err.message)
          }
          resolve({ latitude: '', longitude: '' })
        },
        options
=======
        (error) => {
          let message = 'Gagal mengambil lokasi. '
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message += 'Izin lokasi ditolak. Silakan aktifkan izin lokasi di pengaturan browser Anda.'
              break
            case error.POSITION_UNAVAILABLE:
              message += 'Informasi lokasi tidak tersedia. Pastikan GPS/lokasi aktif di perangkat Anda.'
              break
            case error.TIMEOUT:
              message += 'Waktu permintaan lokasi habis. Coba lagi.'
              break
            default:
              message += 'Terjadi kesalahan yang tidak diketahui.'
          }
          alert(message)
          resolve({
            latitude: '',
            longitude: '',
          })
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
>>>>>>> 1ca02f4 (fix bug location)
      )
    })
  }

  async function handleGetLocation() {
    setGettingLocation(true)
    const location =
      await getCurrentLocation()
    setUser((prev) => ({
      ...prev,
      latitude: location.latitude,
      longitude: location.longitude,
    }))
    setGettingLocation(false)
  }

  async function handleSaveProfile() {
    try {
      setSaving(true)
      const payload = {
        name:
          user.fullname ||
          user.name ||
          'User',
        address:
          user.address || '',
        latitude:
          user.latitude || null,
        longitude:
          user.longitude || null,
      }
      const updatedProfile =
        await updateProfile(payload)
      const updatedUser = {
        ...user,
        ...updatedProfile,
        fullname:
          updatedProfile.name ||
          payload.name,
        name:
          updatedProfile.name ||
          payload.name,
        address:
          updatedProfile.address ||
          payload.address,
        latitude:
          updatedProfile.latitude ??
          payload.latitude,
        longitude:
          updatedProfile.longitude ??
          payload.longitude,
        image_url:
          updatedProfile.image_url ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
            updatedProfile.name ||
              payload.name
          )}`,
      }
      localStorage.setItem(
        'user',
        JSON.stringify(updatedUser)
      )
      setUser(updatedUser)
      setIsEdit(false)
      alert('Profil berhasil disimpan')
    } catch (error) {
      alert(
        error.message ||
          'Gagal menyimpan profile'
      )
    } finally {
      setSaving(false)
    }
  }

  function handleCancelEdit() {
    setIsEdit(false)
  }

  async function handleDeleteAccount() {
    const confirmDelete =
      window.confirm(
        'Yakin ingin menghapus akun?'
      )
    if (!confirmDelete) return
    try {
      setDeleting(true)
      await deleteAccount()
      logout()
      alert('Akun berhasil dihapus')
      navigate('/login')
    } catch (error) {
      alert(
        error.message ||
          'Gagal menghapus akun'
      )
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Layout title="PROFILE">
      <section className="profile-content">
        <div className="profile-card">
          <div className="profile-left-card">
            <div className="profile-cover"></div>
            <div className="profile-avatar-wrapper">
              <img
                src={
                  user.image_url ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                    user.fullname ||
                      user.name ||
                      'User'
                  )}`
                }
                alt="Profile"
                className="profile-avatar"
              />
            </div>
            <h2>
              {user.fullname ||
                user.name ||
                'User'}
            </h2>
            <p>{user.email || '-'}</p>
            <span className="profile-role">
              {isBusiness
                ? 'Business Account'
                : 'Personal Account'}
            </span>
          </div>
          <div className="profile-info-card">
            <h2>Informasi Akun</h2>
            <div className="profile-info-row">
              <UserRound size={30} />
              <span>Nama Lengkap</span>
              {isEdit ? (
                <input
                  type="text"
                  name="fullname"
                  value={
                    user.fullname ||
                    user.name ||
                    ''
                  }
                  onChange={handleInputChange}
                  className="profile-input"
                />
              ) : (
                <strong>
                  {user.fullname ||
                    user.name ||
                    '-'}
                </strong>
              )}
            </div>
            <div className="profile-info-row">
              <Mail size={30} />
              <span>Email</span>
              <strong>
                {user.email || '-'}
              </strong>
            </div>
            <div className="profile-info-row">
              <MapPin size={30} />
              <span>Alamat</span>
              {isEdit ? (
                <textarea
                  name="address"
                  value={user.address || ''}
                  onChange={handleInputChange}
                  className="profile-textarea"
                />
              ) : (
                <strong>
                  {user.address ||
                    'Belum ada alamat'}
                </strong>
              )}
            </div>
            {isEdit && (
              <>
                <div className="profile-location-group">
                  <div>
                    <label>Latitude</label>
                    <input
                      type="text"
                      name="latitude"
                      value={user.latitude || ''}
                      onChange={handleInputChange}
                      className="profile-input"
                    />
                  </div>
                  <div>
                    <label>Longitude</label>
                    <input
                      type="text"
                      name="longitude"
                      value={user.longitude || ''}
                      onChange={handleInputChange}
                      className="profile-input"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  className="get-location-btn"
                  onClick={handleGetLocation}
                  disabled={gettingLocation}
                >
                  {gettingLocation ? 'Mengambil Lokasi...' : 'Ambil Lokasi Saya'}
                </button>
              </>
            )}
            {user.latitude &&
              user.longitude && (
                <iframe
                  title="profile-map"
                  width="100%"
                  height="180"
                  className="profile-map"
                  src={`https://www.google.com/maps?q=${user.latitude},${user.longitude}&output=embed`}
                  allowFullScreen
                />
              )}
            {isEdit ? (
              <div className="profile-action-buttons">
                <button
                  type="button"
                  className="cancel-profile-btn"
                  onClick={handleCancelEdit}
                >
                  Batalkan
                </button>
                <button
                  type="button"
                  className="save-profile-btn"
                  onClick={handleSaveProfile}
                >
                  {saving
                    ? 'Menyimpan...'
                    : 'Simpan'}
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="edit-profile-btn"
                onClick={() =>
                  setIsEdit(true)
                }
              >
                <Pencil size={22} />
                Edit Profil
              </button>
            )}
            <button
              type="button"
              className="delete-account-btn"
              onClick={handleDeleteAccount}
            >
              <Trash2 size={22} />
              {deleting
                ? 'Menghapus...'
                : 'Hapus Akun'}
            </button>
          </div>
        </div>
      </section>
    </Layout>
  )
}