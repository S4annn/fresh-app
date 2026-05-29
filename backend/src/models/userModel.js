import pool from '../config/db.js'

export const createUser = async ({ name, email, password, role, address, latitude, longitude, image_url, otp_code, otp_expired_at, auth_provider }) => {
  const result = await pool.query(
    ` INSERT INTO users (
        name,
        email,
        password,
        role,
        address,
        latitude,
        longitude,
        image_url,
        otp_code,
        otp_expired_at,
        is_verified,
        auth_provider
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,false,COALESCE($11,'local'))
      RETURNING 
        id,
        name,
        email,
        role,
        address,
        latitude,
        longitude,
        image_url,
        is_verified,
        auth_provider
    `,
    [
      name,
      email,
      password,
      role,
      address,
      latitude,
      longitude,
      image_url,
      otp_code,
      otp_expired_at,
      auth_provider || 'local',
    ]
  )
  return result.rows[0]
}

export const getUserByEmail = async (email) => {
  const result = await pool.query(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  )
  return result.rows[0]
}

export const getUserById = async (id) => {
  const result = await pool.query(
    ` SELECT 
        id,
        name,
        email,
        role,
        address,
        location_name,
        latitude,
        longitude,
        image_url,
        is_verified
      FROM users
      WHERE id = $1
    `, [id]
  )
  return result.rows[0]
}

export const verifyUserEmail = async (email) => {
  const result = await pool.query(
    ` UPDATE users
      SET
        is_verified = true,
        otp_code = null,
        otp_expired_at = null
      WHERE email = $1
      RETURNING 
        id,
        name,
        email,
        role,
        address,
        latitude,
        longitude,
        image_url,
        is_verified
    `, [email]
  )
  return result.rows[0]
}

export const updateUserOtp = async ({ email, otp_code, otp_expired_at }) => {
  const result = await pool.query(
    ` UPDATE users
      SET
        otp_code = $1,
        otp_expired_at = $2
      WHERE email = $3
      RETURNING id, email, otp_code, otp_expired_at
    `, [otp_code, otp_expired_at, email]
  )
  return result.rows[0]
}

export const updateUserPassword = async ({ email, password }) => {
  const result = await pool.query(
    ` UPDATE users
      SET
        password = $1,
        otp_code = null,
        otp_expired_at = null
      WHERE email = $2
      RETURNING id, email
    `, [password, email]
  )
  return result.rows[0]
}

export const updateUser = async (
  id,
  {
    name,
    address,
    location_name,
    latitude,
    longitude,
  }
) => {
  const result = await pool.query(
    `
    UPDATE users
    SET
      name = COALESCE($1, name),
      address = COALESCE($2, address),
      location_name = COALESCE($3, location_name),
      latitude = COALESCE($4, latitude),
      longitude = COALESCE($5, longitude)
    WHERE id = $6
    RETURNING 
      id,
      name,
      email,
      role,
      address,
      location_name,
      latitude,
      longitude,
      image_url,
      is_verified
    `,
    [
      name,
      address,
      location_name,
      latitude,
      longitude,
      id,
    ]
  )

  return result.rows[0]
}

export const deleteUser = async (id) => {
  const result = await pool.query(
    ` DELETE FROM users WHERE id = $1
      RETURNING id
    `, [id]
  )
  return result.rows[0]
}