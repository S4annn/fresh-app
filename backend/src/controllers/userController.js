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