import api from './api'

export async function getNotifications() {
  try {
    const response = await api.get('/notifications')

    return response.data.data || []
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        'Gagal mengambil notifikasi'
    )
  }
}

export async function getUnreadNotificationCount() {
  try {
    const response = await api.get('/notifications/unread')

    return response.data.data?.unread_count || 0
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        'Gagal mengambil jumlah notifikasi'
    )
  }
}

export async function markNotificationAsRead(id) {
  try {
    const response = await api.patch(
      `/notifications/${id}/read`
    )

    return response.data.data
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        'Gagal membaca notifikasi'
    )
  }
}

export async function markAllNotificationsAsRead() {
  try {
    const response = await api.patch(
      '/notifications/read-all'
    )

    return response.data
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        'Gagal membaca semua notifikasi'
    )
  }
}

export async function deleteNotification(id) {
  try {
    const response = await api.delete(
      `/notifications/${id}`
    )

    return response.data
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        'Gagal menghapus notifikasi'
    )
  }
}