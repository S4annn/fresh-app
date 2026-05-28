import api from './api'

export async function getPlans() {
  try {
    const response = await api.get('/subscription/plans')
    return response.data.data
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Gagal memuat daftar paket'
    )
  }
}

export async function getMySubscription() {
  try {
    const response = await api.get('/subscription/me')
    return response.data.data
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Gagal memuat subscription'
    )
  }
}

export async function createCheckout({ plan, billing_cycle = 'monthly' }) {
  try {
    const response = await api.post('/subscription/checkout', {
      plan,
      billing_cycle,
    })
    return response.data.data
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Gagal membuat checkout'
    )
  }
}

export async function simulatePayment({ plan, billing_cycle, payment_method }) {
  try {
    const response = await api.post('/subscription/simulate-payment', {
      plan,
      billing_cycle,
      payment_method,
    })
    return response.data.data
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Pembayaran simulasi gagal'
    )
  }
}

export async function cancelSubscription() {
  try {
    const response = await api.post('/subscription/cancel')
    return response.data.data
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Gagal membatalkan subscription'
    )
  }
}

export async function getPaymentHistory() {
  try {
    const response = await api.get('/subscription/payments')
    return response.data.data
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Gagal memuat riwayat pembayaran'
    )
  }
}
