import bcrypt from 'bcrypt'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { getSupabaseAdmin } from '../config/supabaseAdmin.js'
import { createUser, getUserByEmail, getUserById, verifyUserEmail, updateUserOtp, updateUserPassword, updateUser, deleteUser } from '../models/userModel.js'
import { sendEmail } from '../utils/sendEmail.js'

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

const generateOtpExpiredAt = () => {
  const expiredAt = new Date()

  expiredAt.setMinutes(
    expiredAt.getMinutes() +
      Number(process.env.OTP_EXPIRED_MINUTES || 5)
  )

  return expiredAt
}

export const registerUser = async (data) => {
  let {
    name,
    email,
    password,
    role,
    address,
    latitude,
    longitude,
    image_url,
  } = data

  email = email.toLowerCase()

  const existing = await getUserByEmail(email)

  if (existing) {
    const error = new Error('Email sudah terdaftar')
    error.statusCode = 409
    throw error
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const otpCode = generateOtp()
  const otpExpiredAt = generateOtpExpiredAt()

  const user = await createUser({
    name,
    email,
    password: hashedPassword,
    role,
    address,
    latitude,
    longitude,
    image_url:
      image_url ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${email}`,
    otp_code: otpCode,
    otp_expired_at: otpExpiredAt,
    auth_provider: 'local',
  })

  await sendEmail({
    to: email,
    subject: 'Kode OTP Verifikasi Akun FRESH',
    html: `
      <h2>Verifikasi Akun FRESH</h2>
      <p>Kode OTP kamu:</p>
      <h1>${otpCode}</h1>
    `,
  })

  return user
}

export const verifyRegisterOtp = async ({ email, otpCode }) => {
  email = email.toLowerCase()

  const user = await getUserByEmail(email)

  if (!user) {
    const error = new Error('User tidak ditemukan')
    error.statusCode = 404
    throw error
  }

  if (user.is_verified) {
    const error = new Error('Akun sudah diverifikasi')
    error.statusCode = 400
    throw error
  }

  if (!user.otp_code || !user.otp_expired_at) {
    const error = new Error('OTP tidak tersedia')
    error.statusCode = 400
    throw error
  }

  if (user.otp_code !== otpCode) {
    const error = new Error('OTP salah')
    error.statusCode = 400
    throw error
  }

  if (new Date() > new Date(user.otp_expired_at)) {
    const error = new Error('OTP sudah expired')
    error.statusCode = 400
    throw error
  }

  return await verifyUserEmail(email)
}

export const resendRegisterOtp = async ({ email }) => {
  email = email.toLowerCase()

  const user = await getUserByEmail(email)

  if (!user) {
    const error = new Error('User tidak ditemukan')
    error.statusCode = 404
    throw error
  }

  if (user.is_verified) {
    const error = new Error('Akun sudah diverifikasi')
    error.statusCode = 400
    throw error
  }

  const otpCode = generateOtp()
  const otpExpiredAt = generateOtpExpiredAt()

  await updateUserOtp({
    email,
    otp_code: otpCode,
    otp_expired_at: otpExpiredAt,
  })

await sendEmail({
  to: email,

  subject: 'Kode Verifikasi FRESH',

  html: `
    <div
      style="
        font-family: Arial, sans-serif;
        background: #f4f7f5;
        padding: 30px;
      "
    >

      <div
        style="
          max-width: 520px;
          margin: auto;
          background: white;
          border-radius: 14px;
          padding: 36px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
        "
      >

        <h1
          style="
            color: #176b2c;
            margin-bottom: 10px;
            text-align: center;
          "
        >
          F.R.E.S.H
        </h1>

        <p
          style="
            text-align: center;
            color: #666;
            margin-bottom: 28px;
          "
        >
          Food Resource Efficiency & Smart Handling
        </p>

        <h2 style="color:#111;">
          Verifikasi Akun
        </h2>

        <p style="color:#444;">
          Halo,
        </p>

        <p style="color:#444;">
          Gunakan kode OTP berikut untuk
          memverifikasi akun kamu:
        </p>

        <div
          style="
            margin: 30px 0;
            text-align: center;
          "
        >
          <span
            style="
              display: inline-block;
              background: #176b2c;
              color: white;
              font-size: 34px;
              font-weight: bold;
              letter-spacing: 8px;
              padding: 18px 28px;
              border-radius: 12px;
            "
          >
            ${otpCode}
          </span>
        </div>

        <p style="color:#444;">
          OTP berlaku selama
          <strong>5 menit</strong>.
        </p>

        <p style="color:#444;">
          Jika kamu tidak meminta kode ini,
          abaikan email ini.
        </p>

        <hr
          style="
            border: none;
            border-top: 1px solid #eee;
            margin: 30px 0;
          "
        />

        <p
          style="
            font-size: 12px;
            color: #888;
            text-align: center;
          "
        >
          Email otomatis dari FRESH App.
        </p>

      </div>

    </div>
  `,
})

  return true
}

export const loginUser = async ({ email, password }) => {
  email = email.toLowerCase()

  const user = await getUserByEmail(email)

  if (!user) {
    const error = new Error('User tidak ditemukan')
    error.statusCode = 404
    throw error
  }

  if (!user.is_verified) {
    const error = new Error('Akun belum diverifikasi OTP')
    error.statusCode = 403
    throw error
  }

  const match = await bcrypt.compare(password, user.password)

  if (!match) {
    const error = new Error('Password salah')
    error.statusCode = 401
    throw error
  }

  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '1d',
    }
  )

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role,
      image_url: user.image_url,
      is_verified: user.is_verified,
    },
  }
}

export const googleLoginService = async (supabaseAccessToken) => {
  if (!supabaseAccessToken) {
    const error = new Error('Token Supabase tidak ditemukan')
    error.statusCode = 400
    throw error
  }

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    const error = new Error(
      'Login Google belum dikonfigurasi di server. Hubungi admin.'
    )
    error.statusCode = 503
    throw error
  }

  // Supabase server-side dapat memverifikasi access token user dengan
  // memanggil `auth.getUser(token)`. Ini akan return profil OAuth user yang
  // sudah diverifikasi oleh Supabase Auth. Kita lalu sinkronisasi datanya
  // ke tabel `users` di Postgres kita sendiri.
  const { data, error: supaError } = await supabase.auth.getUser(supabaseAccessToken)

  if (supaError || !data?.user) {
    const error = new Error('Token Google tidak valid atau sudah kedaluwarsa.')
    error.statusCode = 401
    throw error
  }

  const supaUser = data.user
  const email = supaUser.email?.toLowerCase()

  if (!email) {
    const error = new Error('Email Google tidak ditemukan')
    error.statusCode = 400
    throw error
  }

  const fullName =
    supaUser.user_metadata?.full_name ||
    supaUser.user_metadata?.name ||
    email.split('@')[0]
  const picture =
    supaUser.user_metadata?.avatar_url ||
    supaUser.user_metadata?.picture ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${email}`

  let user = await getUserByEmail(email)

  // Auto-provision: kalau belum ada akun, buat akun baru otomatis dari data Google.
  // Email Google sudah terverifikasi, jadi langsung is_verified=true.
  if (!user) {
    const randomPassword = crypto.randomBytes(24).toString('hex')
    const hashedPassword = await bcrypt.hash(randomPassword, 10)

    await createUser({
      name: fullName,
      email,
      password: hashedPassword,
      role: 'pribadi',
      address: null,
      latitude: null,
      longitude: null,
      image_url: picture,
      otp_code: null,
      otp_expired_at: null,
      auth_provider: 'google',
    })

    user = await verifyUserEmail(email)
  } else if (!user.is_verified) {
    user = await verifyUserEmail(email)
  }

  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '1d',
    }
  )

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role,
      image_url: user.image_url,
      is_verified: user.is_verified,
    },
  }
}

export const forgotPassword = async ({ email }) => {
  email = email.toLowerCase()

  const user = await getUserByEmail(email)

  if (!user) {
    const error = new Error('Email tidak ditemukan')
    error.statusCode = 404
    throw error
  }

  const otpCode = generateOtp()
  const otpExpiredAt = generateOtpExpiredAt()

  await updateUserOtp({
    email,
    otp_code: otpCode,
    otp_expired_at: otpExpiredAt,
  })

  await sendEmail({
    to: email,
    subject: 'Kode OTP Reset Password FRESH',
    html: `
      <h2>Reset Password FRESH</h2>
      <p>Kode OTP reset password kamu:</p>
      <h1>${otpCode}</h1>
      <p>Kode ini berlaku selama ${process.env.OTP_EXPIRED_MINUTES || 5} menit.</p>
    `,
  })

  return true
}

export const resetPassword = async ({ email, otpCode, newPassword }) => {
  email = email.toLowerCase()

  const user = await getUserByEmail(email)

  if (!user) {
    const error = new Error('User tidak ditemukan')
    error.statusCode = 404
    throw error
  }

  if (!user.otp_code || !user.otp_expired_at) {
    const error = new Error('OTP tidak tersedia')
    error.statusCode = 400
    throw error
  }

  if (user.otp_code !== otpCode) {
    const error = new Error('OTP salah')
    error.statusCode = 400
    throw error
  }

  if (new Date() > new Date(user.otp_expired_at)) {
    const error = new Error('OTP sudah expired')
    error.statusCode = 400
    throw error
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10)

  await updateUserPassword({
    email,
    password: hashedPassword,
  })

  return true
}

export const getProfile = async (userId) => {
  const user = await getUserById(userId)

  if (!user) {
    const error = new Error('User tidak ditemukan')
    error.statusCode = 404
    throw error
  }

  return user
}

export const updateProfile = async (userId, data) => {
  const user = await updateUser(userId, data)

  if (!user) {
    const error = new Error('User tidak ditemukan')
    error.statusCode = 404
    throw error
  }

  return user
}

export const removeUser = async (userId) => {
  const user = await deleteUser(userId)

  if (!user) {
    const error = new Error('User tidak ditemukan')
    error.statusCode = 404
    throw error
  }

  return user
}