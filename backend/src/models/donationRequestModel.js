import pool from '../config/db.js'

export const createDonationRequestModel = async ({ donation_id, requester_id, quantity, pickup_time, notes }) => {
  const result = await pool.query(
    ` INSERT INTO donation_requests
      (
        donation_id,
        requester_id,
        quantity,
        pickup_time,
        notes,
        status,
        created_at
      )
      VALUES ($1, $2, $3, $4, $5, 'pending', NOW())
      RETURNING *
    `, [donation_id, requester_id, quantity, pickup_time, notes]
  )
  return result.rows[0]
}

export const getDonationRequestsModel = async (donationId) => {
  const result = await pool.query(
    ` SELECT
        dr.id,
        dr.donation_id,
        dr.requester_id,
        dr.quantity,
        dr.pickup_time,
        dr.notes,
        dr.status,
        TO_CHAR(dr.created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at,
        u.name AS requester_name
      FROM donation_requests dr
      JOIN users u
        ON dr.requester_id = u.id
      WHERE dr.donation_id = $1
      ORDER BY dr.created_at DESC
    `, [donationId]
  )
  return result.rows
}

export const getDonationRequestById = async (requestId) => {
  const result = await pool.query(
    `SELECT * FROM donation_requests WHERE id = $1`, [requestId]
  )
  return result.rows[0]
}

export const getRequestsByRequester = async (userId) => {
  const result = await pool.query(
    ` SELECT
        dr.id,
        dr.donation_id,
        dr.requester_id,
        dr.quantity,
        dr.pickup_time,
        dr.notes,
        dr.status,
        TO_CHAR(dr.created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at,

        d.food_name,
        d.unit,
        d.pickup_location,
        TO_CHAR(d.expiry_date, 'YYYY-MM-DD') AS expiry_date,

        u.name AS donor_name
      FROM donation_requests dr
      JOIN donations d
        ON dr.donation_id = d.id
      JOIN users u
        ON d.user_id = u.id
      WHERE dr.requester_id = $1
      ORDER BY dr.created_at DESC
    `, [userId]
  )
  return result.rows
}

export const updateDonationRequestStatusModel = async (requestId,status) => {
  const result = await pool.query(
    ` UPDATE donation_requests SET status = $1 WHERE id = $2
      RETURNING *
    `, [status, requestId]
  )
  return result.rows[0]
}