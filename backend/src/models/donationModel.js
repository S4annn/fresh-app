import pool from '../config/db.js'

export const createDonation = async (userId, data) => {
  const result = await pool.query(
    ` INSERT INTO donations
      (
        user_id,
        food_name,
        quantity,
        remaining_quantity,
        unit,
        pickup_location,
        expiry_date,
        donor_name,
        notes,
        status,
        created_at
      )
      SELECT
        u.id,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        u.name,
        $8,
        'available',
        NOW()
      FROM users u
      WHERE u.id = $1
      RETURNING
        id,
        user_id,
        user_id AS donor_id,
        food_name,
        quantity,
        remaining_quantity,
        unit,
        pickup_location,
        TO_CHAR(expiry_date, 'YYYY-MM-DD') AS expiry_date,
        donor_name,
        notes,
        status,
        TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at
    `,
    [
      userId,
      data.food_name,
      data.quantity,
      data.quantity,
      data.unit,
      data.pickup_location,
      data.expiry_date,
      data.notes || null,
    ]
  )
  return result.rows[0]
}

export const getAllDonations = async (viewerId) => {
  const result = await pool.query(
    `
    SELECT
      d.id,
      d.user_id,
      d.user_id AS donor_id,
      d.food_name,
      d.quantity,
      d.remaining_quantity,
      d.unit,
      d.pickup_location,
      TO_CHAR(d.expiry_date, 'YYYY-MM-DD') AS expiry_date,
      d.donor_name,
      d.notes,
      d.status,

      donor.latitude AS donor_latitude,
      donor.longitude AS donor_longitude,

      CASE
        WHEN d.user_id = $1::int THEN true
        ELSE false
      END AS is_my_donation,

      TO_CHAR(d.created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at,

      CASE
        WHEN donor.latitude IS NULL
          OR donor.longitude IS NULL
          OR viewer.latitude IS NULL
          OR viewer.longitude IS NULL
        THEN NULL
        ELSE ROUND(
          (
            6371 * ACOS(
              LEAST(
                1,
                GREATEST(
                  -1,
                  COS(RADIANS(viewer.latitude::numeric)) *
                  COS(RADIANS(donor.latitude::numeric)) *
                  COS(
                    RADIANS(donor.longitude::numeric) -
                    RADIANS(viewer.longitude::numeric)
                  ) +
                  SIN(RADIANS(viewer.latitude::numeric)) *
                  SIN(RADIANS(donor.latitude::numeric))
                )
              )
            )
          )::numeric,
          2
        )
      END AS donation_distance

    FROM donations d

    JOIN users donor
      ON donor.id = d.user_id

    JOIN users viewer
      ON viewer.id = $1::int

    WHERE d.status IN ('available', 'completed')

    ORDER BY
      is_my_donation DESC,
      donation_distance ASC NULLS LAST,
      d.created_at DESC
    `,
    [Number(viewerId)]
  )

  return result.rows
}

export const getDonationById = async (id) => {
  const result = await pool.query(
    ` SELECT
        id,
        user_id,
        user_id AS donor_id,
        food_name,
        quantity,
        remaining_quantity,
        unit,
        pickup_location,
        expiry_date,
        donor_name,
        notes,
        status,
        created_at
      FROM donations
      WHERE id = $1
    `, [id]
  )
  return result.rows[0]
}

export const updateDonationStatus = async (id, userId, status) => {
  const result = await pool.query(
    ` UPDATE donations
      SET status = $1
      WHERE id = $2
        AND user_id = $3
      RETURNING
        id,
        user_id,
        user_id AS donor_id,
        food_name,
        quantity,
        remaining_quantity,
        unit,
        pickup_location,
        TO_CHAR(expiry_date, 'YYYY-MM-DD') AS expiry_date,
        donor_name,
        notes,
        status,
        TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at
    `, [status, id, userId]
  )
  return result.rows[0]
}

export const updateDonationRemainingQuantity = async (id, remainingQuantity) => {
  const result = await pool.query(
    ` UPDATE donations
      SET
        remaining_quantity = $1::integer,
        status = CASE
          WHEN $1::integer <= 0 THEN 'completed'
          ELSE status
        END
      WHERE id = $2::integer
      RETURNING *
    `,[Number(remainingQuantity), Number(id)]
  )
  return result.rows[0]
}

export const deleteDonation = async (id, userId) => {
  const result = await pool.query(
    ` DELETE FROM donations
      WHERE id = $1
        AND user_id = $2
      RETURNING id
    `, [id, userId]
  )
  return result.rows[0]
}