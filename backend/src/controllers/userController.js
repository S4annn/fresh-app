import {
  registerUser,
  verifyRegisterOtp,
  resendRegisterOtp,
  loginUser,
  googleLoginService,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  removeUser,
} from '../services/userServices.js'

export const register = async (req, res, next) => {
  try {
    const user = await registerUser(req.body)

    res.status(201).json({
      status: 'success',
      message: 'Register berhasil, silakan cek email untuk OTP',
      data: user,
    })
  } catch (err) {
    next(err)
  }
}

export const verifyOtp = async (req, res, next) => {
  try {
    const user = await verifyRegisterOtp(req.body)

    res.json({
      status: 'success',
      message: 'OTP berhasil diverifikasi',
      data: user,
    })
  } catch (err) {
    next(err)
  }
}

export const resendOtp = async (req, res, next) => {
  try {
    await resendRegisterOtp(req.body)

    res.json({
      status: 'success',
      message: 'OTP baru berhasil dikirim',
    })
  } catch (err) {
    next(err)
  }
}

export const login = async (req, res, next) => {
  try {
    const result = await loginUser(req.body)

    res.json({
      status: 'success',
      message: 'Login berhasil',
      data: result,
    })
  } catch (err) {
    next(err)
  }
}

export const googleLogin = async (req, res, next) => {
  try {
    const { token } = req.body

    const result = await googleLoginService(token)

    res.json({
      status: 'success',
      message: 'Login Google berhasil',
      data: result,
    })
  } catch (err) {
    next(err)
  }
}

export const forgotPasswordController = async (req, res, next) => {
  try {
    await forgotPassword(req.body)

    res.json({
      status: 'success',
      message: 'OTP reset password berhasil dikirim ke email',
    })
  } catch (err) {
    next(err)
  }
}

export const resetPasswordController = async (req, res, next) => {
  try {
    await resetPassword(req.body)

    res.json({
      status: 'success',
      message: 'Password berhasil direset',
    })
  } catch (err) {
    next(err)
  }
}

export const getUserProfile = async (req, res, next) => {
  try {
    const user = await getProfile(req.user.id)

    res.json({
      status: 'success',
      data: user,
    })
  } catch (err) {
    next(err)
  }
}

export const updateUserProfile = async (req, res, next) => {
  try {
    const updatedUser = await updateProfile(
      req.user.id,
      req.body
    )

    res.json({
      status: 'success',
      message: 'Profile berhasil diperbarui',
      data: updatedUser,
    })
  } catch (err) {
    next(err)
  }
}

export const deleteUserController = async (req, res, next) => {
  try {
    await removeUser(req.user.id)

    res.json({
      status: 'success',
      message: 'User berhasil dihapus',
    })
  } catch (err) {
    next(err)
  }
}

export const getUserLocation = async (req, res, next) => {
  try {
    const user = await getProfile(req.user.id)

    res.json({
      status: 'success',
      data: {
        latitude: user.latitude || null,
        longitude: user.longitude || null,
        location_name: user.location_name || null,
      },
    })
  } catch (err) {
    next(err)
  }
}

export const updateUserLocation = async (req, res, next) => {
  try {
    const { latitude, longitude, location_name } = req.body

    if (!latitude || !longitude) {
      return res.status(400).json({
        status: 'error',
        message: 'latitude dan longitude wajib diisi',
      })
    }

    const updatedUser = await updateProfile(req.user.id, {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      location_name: location_name || null,
    })

    res.json({
      status: 'success',
      message: 'Lokasi berhasil diperbarui',
      data: {
        latitude: updatedUser.latitude,
        longitude: updatedUser.longitude,
        location_name: updatedUser.location_name,
      },
    })
  } catch (err) {
    next(err)
  }
}