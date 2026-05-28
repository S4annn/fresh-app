import api from './api'

export async function createTransaction(items) {
  try {
    const response = await api.post('/transactions', {
      items,
    })
    return response.data.data
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Gagal membuat transaksi'
    )
  }
}

export async function getMyOrders() {
  try {
    const response = await api.get('/transactions/my-orders')
    return response.data.data || []
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Gagal mengambil data pesanan'
    )
  }
}

export async function getSales() {
  try {
    const response = await api.get('/transactions/sales')
    return response.data.data || []
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Gagal mengambil data penjualan'
    )
  }
}

export async function getTransactionDetail(id) {
  try {
    const response = await api.get(`/transactions/${id}`)
    return response.data.data
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Gagal mengambil detail transaksi'
    )
  }
}

export async function updateTransactionStatus(id, status) {
  try {
    const response = await api.patch(`/transactions/${id}/status`, {
      status,
    })
    return response.data.data
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Gagal memperbarui status transaksi'
    )
  }
}
