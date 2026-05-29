import api from './api'

export async function register(userData) {
  try {
    const response = await api.post('/auth/register', userData)
    return response.data.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Registrasi gagal')
  }
}

export async function login({ email, password }) {
  try {
    const response = await api.post('/auth/login', {
      email,
      password,
    })
    return response.data.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Login gagal')
  }
}

export async function loginGoogle(firebaseToken) {
  try {
    const response = await api.post('/auth/google', {
      token: firebaseToken,
    })
    return response.data.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Login Google gagal')
  }
}

export async function getProfile() {
  try {
    const response = await api.get('/users/profile')
    return response.data.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Gagal mengambil profile')
  }
}

export async function updateProfile(data) {
  try {
    const response = await api.put('/users/profile', data)
    return response.data.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Gagal update profile')
  }
}

export async function deleteAccount() {
  try {
    const response = await api.delete('/users/profile')
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Gagal menghapus akun')
  }
}

/**
 * Ambil lokasi user dari backend
 */
export async function getUserLocation() {
  try {
    const response = await api.get('/users/location')
    return response.data.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Gagal mengambil lokasi')
  }
}

/**
 * Simpan lokasi user ke backend
 * @param {{latitude: number, longitude: number, location_name?: string}} locationData
 */
export async function saveUserLocationToServer(locationData) {
  try {
    const response = await api.post('/users/location', locationData)
    return response.data.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Gagal menyimpan lokasi')
  }
}

export function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export function isAuthenticated() {
  return !!localStorage.getItem('token')
}

export function getCurrentUser() {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

export async function forgotPassword(email) {
  try {
    const response = await api.post('/auth/forgot-password', {
      email: typeof email === 'string' ? email : email.email,
    })

    return response.data
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Gagal mengirim reset password'
    )
  }
}

export async function verifyOtp({ email, otpCode }) {
  try {
    const response = await api.post('/auth/verify-otp', {
      email,
      otpCode,
    })
    return response.data.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Verifikasi OTP gagal')
  }
}

export async function resendOtp(email) {
  try {
    const response = await api.post('/auth/resend-otp', {
      email,
    })
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Gagal mengirim ulang OTP')
  }
}

export async function resetPassword({ email, otpCode, newPassword }) {
  try {
    const response = await api.post('/auth/reset-password', {
      email,
      otpCode,
      newPassword,
    })
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Gagal reset password')
  }
}