import api from './api'

export async function getRecommendations() {
  try {
    const response = await api.get('/recommendations')

    return response.data.data || {
      use_today_items: [],
      recommendations: [],
    }
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        'Gagal mengambil rekomendasi AI'
    )
  }
}

export async function getUseTodayItems() {
  try {
    const data = await getRecommendations()

    return data.use_today_items || []
  } catch (error) {
    throw new Error(
      error.message ||
        'Gagal mengambil bahan yang harus digunakan hari ini'
    )
  }
}

export async function getAIRecommendations() {
  try {
    const data = await getRecommendations()

    return data.recommendations || []
  } catch (error) {
    throw new Error(
      error.message ||
        'Gagal mengambil rekomendasi cerdas'
    )
  }
}

export async function getTopRecommendation() {
  try {
    const data = await getRecommendations()

    return data.recommendations?.[0] || null
  } catch (error) {
    throw new Error(
      error.message ||
        'Gagal mengambil rekomendasi utama'
    )
  }
}