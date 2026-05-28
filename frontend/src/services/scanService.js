import api from './api'

export async function scanFoodImage(file) {
  try {
    const formData = new FormData()

    formData.append('image', file)

    const response = await api.post(
      '/scans',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )

    return response.data.data
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        'Gagal memindai makanan'
    )
  }
}