import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, LogOut, Menu } from 'lucide-react'
import { getUnreadNotificationCount } from '../services/notificationService'

function readStoredUser() {
  try {
    const raw = localStorage.getItem('user')
    if (!raw || raw === 'undefined' || raw === 'null') return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function getInitials(name) {
  if (!name) return 'F'
  const parts = String(name).trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export default function AppHeader({ title = 'DASHBOARD', onOpenSidebar }) {
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)

  async function loadUnreadCount() {
    try {
      const total = await getUnreadNotificationCount()
      setUnreadCount(total)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    loadUnreadCount()
    const interval = setInterval(loadUnreadCount, 5000)
    return () => clearInterval(interval)
  }, [])

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login', { replace: true })
  }

  function handleOpenNotifications() {
    const user = readStoredUser()
    const role = String(user?.role || '').toLowerCase()

    if (role === 'business' || role === 'bisnis') {
      navigate('/notifications-bisnis')
      return
    }

    navigate('/notifications')
  }

  const user = readStoredUser()
  const userName = user?.fullname || user?.name || 'Pengguna'
  const userRole =
    String(user?.role || '').toLowerCase() === 'bisnis'
      ? 'Bisnis'
      : 'Pribadi'

  return (
    <header className="app-header">
      <div className="app-header__title">
        <button
          type="button"
          className="app-header__menu-btn"
          onClick={onOpenSidebar}
          aria-label="Buka menu"
        >
          <Menu size={20} strokeWidth={2.4} />
        </button>

        <h1>{title}</h1>
      </div>

      <div className="app-header__actions">
        <button
          type="button"
          className="app-header__btn"
          onClick={handleOpenNotifications}
          aria-label="Notifikasi"
        >
          <Bell size={18} strokeWidth={2.2} />

          {unreadCount > 0 && (
            <span className="app-header__btn-badge">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        <div className="app-header__user">
          <span className="app-header__avatar">
            {getInitials(userName)}
          </span>

          <div className="app-header__user-text">
            <strong>{userName}</strong>
            <span>Akun {userRole}</span>
          </div>
        </div>

        <button
          type="button"
          className="app-header__logout"
          onClick={handleLogout}
          aria-label="Keluar"
        >
          <LogOut size={16} strokeWidth={2.4} />
          <span>Keluar</span>
        </button>
      </div>
    </header>
  )
}