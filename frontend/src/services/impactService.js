import api from './api'

export async function getPersonalImpact() {
  try {
    const response = await api.get('/impact/personal')
    return response.data.data
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Gagal mengambil data dampak'
    )
  }
}

export async function getBusinessImpact() {
  try {
    const response = await api.get('/impact/business')
    return response.data.data
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Gagal mengambil data dampak bisnis'
    )
  }
}
