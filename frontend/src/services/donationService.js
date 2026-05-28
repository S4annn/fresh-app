import api from './api'

export async function getDonations() {
  try {
    const response = await api.get('/donations')
    return response.data.data || []
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        'Gagal mengambil data donasi'
    )
  }
}

export async function addDonation(data) {
  try {
    const response = await api.post('/donations', data)
    return response.data
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        'Gagal menambahkan donasi'
    )
  }
}

export async function updateDonationStatus(id, status) {
  try {
    const response = await api.patch(
      `/donations/${id}/status`,
      { status }
    )
    return response.data
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        'Gagal mengubah status donasi'
    )
  }
}

export async function deleteDonation(id) {
  try {
    const response = await api.delete(
      `/donations/${id}`
    )
    return response.data
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        'Gagal menghapus donasi'
    )
  }
}

export async function addDonationRequest(
  donationId,
  data
) {
  try {
    const response = await api.post(
      `/donations/${donationId}/requests`,
      data
    )
    return response.data
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        'Gagal membuat request donasi'
    )
  }
}

export async function getDonationRequests(
  donationId
) {
  try {
    const response = await api.get(
      `/donations/${donationId}/requests`
    )
    return response.data.data || []
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        'Gagal mengambil request donasi'
    )
  }
}

export async function getMyDonationRequests() {
  try {
    const response = await api.get(
      '/donation-requests/my'
    )
    return response.data.data || []
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        'Gagal mengambil request saya'
    )
  }
}

export async function updateDonationRequestStatus(
  requestId,
  status
) {
  try {
    const response = await api.patch(
      `/donation-requests/${requestId}/status`,
      { status }
    )
    return response.data
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        'Gagal mengubah status request'
    )
  }
}