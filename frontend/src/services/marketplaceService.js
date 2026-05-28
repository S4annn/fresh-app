import api from './api'

export async function getMarketplaceProducts(search = '') {
  try {
    const response = await api.get('/marketplace', {
      params: {
        search,
      },
    })
    return response.data.data || []
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Gagal mengambil data marketplace'
    )
  }
}
