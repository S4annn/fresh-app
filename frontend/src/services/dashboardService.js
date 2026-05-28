import api from './api'

export async function getPersonalDashboard() {
  try {
    const response = await api.get('/dashboard/personal')
    return response.data.data
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        'Gagal mengambil dashboard personal'
    )
  }
}

export async function getBusinessDashboard() {
  try {
    const response = await api.get('/dashboard/business')
    return response.data.data
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        'Gagal mengambil dashboard bisnis'
    )
  }
}