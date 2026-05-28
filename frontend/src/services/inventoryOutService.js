import api from './api'

export async function createInventoryOut(inventoryId, data) {
  try {
    const response = await api.post(
      `/inventory-outs/${inventoryId}/out`,
      data
    )

    return response.data.data
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        'Gagal menggunakan inventory'
    )
  }
}

export async function getInventoryOuts() {
  try {
    const response = await api.get(
      '/inventory-outs'
    )

    return response.data.data || []
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        'Gagal mengambil riwayat inventory keluar'
    )
  }
}