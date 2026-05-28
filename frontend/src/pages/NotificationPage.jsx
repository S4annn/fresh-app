import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCheck, Trash2 } from 'lucide-react'
import AppLayout from '../components/AppLayout'
import BusinessLayout from '../components/BusinessLayout'
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } from '../services/notificationService'
import '../styles/notification.css'

export default function NotificationPage() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const user = JSON.parse(
    localStorage.getItem('user') || '{}'
  )
  const Layout =
    user.role === 'bisnis'
      ? BusinessLayout
      : AppLayout
  useEffect(() => {
    async function fetchNotifications() {
      try {
        setLoading(true)
        const data = await getNotifications()
        setNotifications(data || [])
      } catch (error) {
        alert(error.message)
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchNotifications()
  }, [])

  async function handleRead(id) {
    try {
      setActionLoading(true)
      await markNotificationAsRead(id)
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                is_read: true,
              }
            : item
        )
      )
    } catch (error) {
      alert(error.message)
      console.error(error)
    } finally {
      setActionLoading(false)
    }
  }

  async function handleReadAll() {
    try {
      setActionLoading(true)
      await markAllNotificationsAsRead()
      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          is_read: true,
        }))
      )
    } catch (error) {
      alert(error.message)
      console.error(error)
    } finally {
      setActionLoading(false)
    }
  }

  async function handleDelete(id) {
    const confirmDelete = window.confirm(
      'Yakin ingin menghapus notifikasi ini?'
    )
    if (!confirmDelete) return
    try {
      setActionLoading(true)
      await deleteNotification(id)
      setNotifications((prev) =>
        prev.filter((item) => item.id !== id)
      )
    } catch (error) {
      alert(error.message)
      console.error(error)
    } finally {
      setActionLoading(false)
    }
  }

  function getNotificationRoute(item) {
    const title = String(item.title || '').toLowerCase()
    const message = String(item.message || '').toLowerCase()
    const text = `${title} ${message}`
    if (
      text.includes('donasi') ||
      text.includes('donation')
    ) {
      return '/donasi'
    }
    if (
      text.includes('pesanan') ||
      text.includes('order') ||
      text.includes('transaksi')
    ) {
      return user.role === 'bisnis'
        ? '/pesanan-bisnis'
        : '/pesanan'
    }
    if (
      text.includes('inventory') ||
      text.includes('inventori') ||
      text.includes('kedaluwarsa') ||
      text.includes('expired') ||
      text.includes('hampir habis')
    ) {
      return '/inventory'
    }
    return '/notification'
  }

  async function handleOpenNotification(item) {
    try {
      if (!item.is_read) {
        await markNotificationAsRead(item.id)
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === item.id
              ? {
                  ...notif,
                  is_read: true,
                }
              : notif
          )
        )
      }
      navigate(getNotificationRoute(item))
    } catch (error) {
      alert(error.message)
      console.error(error)
    }
  }

  const unreadCount =
    notifications.filter((item) => !item.is_read).length

  return (
    <Layout
      title="NOTIFIKASI"
      pageTitle="NOTIFIKASI"
    >
      <section className="notification-content">
        <div className="notification-card">
          <div className="notification-header">
            <div>
              <h2>Notifikasi</h2>
              <p>
                {user.role === 'bisnis'
                  ? 'Notifikasi akun bisnis'
                  : 'Notifikasi akun pribadi'}
              </p>
              <p>
                {unreadCount > 0
                  ? `${unreadCount} notifikasi belum dibaca`
                  : 'Semua notifikasi sudah dibaca'}
              </p>
            </div>
            <button
              type="button"
              className="read-all-btn"
              onClick={handleReadAll}
              disabled={
                actionLoading ||
                unreadCount === 0
              }
            >
              <CheckCheck size={18} />
              Tandai Semua Dibaca
            </button>
          </div>
          {loading ? (
            <div className="notification-empty">
              Memuat notifikasi...
            </div>
          ) : notifications.length > 0 ? (
            <div className="notification-list">
              {notifications.map((item) => (
                <div
                  key={item.id}
                  className={
                    item.is_read
                      ? 'notification-item read'
                      : 'notification-item unread'
                  }
                  onClick={() =>
                    handleOpenNotification(item)
                  }
                >
                  <div className="notification-icon">
                    <Bell size={22} />
                  </div>
                  <div className="notification-info">
                    <h3>{item.title}</h3>
                    <p>{item.message}</p>
                    <span>{item.created_at}</span>
                  </div>
                  <div
                    className="notification-actions"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {!item.is_read && (
                      <button
                        type="button"
                        className="read-btn"
                        onClick={() =>
                          handleRead(item.id)
                        }
                        disabled={actionLoading}
                      >
                        Dibaca
                      </button>
                    )}
                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() =>
                        handleDelete(item.id)
                      }
                      disabled={actionLoading}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="notification-empty">
              Belum ada notifikasi.
            </div>
          )}
        </div>
      </section>
    </Layout>
  )
}