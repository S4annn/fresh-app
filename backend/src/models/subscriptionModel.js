import pool from '../config/db.js'

/**
 * Get current subscription row for a user. Returns null if none exists yet.
 * (When null is returned, callers should treat the user as Free plan.)
 */
export const getSubscriptionByUserId = async (userId) => {
  const result = await pool.query(
    `
    SELECT
      id,
      user_id,
      plan,
      status,
      billing_cycle,
      amount_paid,
      last_payment_method,
      last_payment_reference,
      TO_CHAR(started_at, 'YYYY-MM-DD HH24:MI:SS') AS started_at,
      TO_CHAR(ends_at,    'YYYY-MM-DD HH24:MI:SS') AS ends_at,
      TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at,
      TO_CHAR(updated_at, 'YYYY-MM-DD HH24:MI:SS') AS updated_at
    FROM subscriptions
    WHERE user_id = $1
    `,
    [userId]
  )
  return result.rows[0] || null
}

/**
 * UPSERT subscription for a user. Creates a row if missing, otherwise updates.
 */
export const upsertSubscription = async ({
  user_id,
  plan,
  status,
  billing_cycle,
  amount_paid,
  last_payment_method,
  last_payment_reference,
  started_at,
  ends_at,
}) => {
  const result = await pool.query(
    `
    INSERT INTO subscriptions (
      user_id, plan, status, billing_cycle, amount_paid,
      last_payment_method, last_payment_reference,
      started_at, ends_at, updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      plan = EXCLUDED.plan,
      status = EXCLUDED.status,
      billing_cycle = EXCLUDED.billing_cycle,
      amount_paid = EXCLUDED.amount_paid,
      last_payment_method = EXCLUDED.last_payment_method,
      last_payment_reference = EXCLUDED.last_payment_reference,
      started_at = EXCLUDED.started_at,
      ends_at = EXCLUDED.ends_at,
      updated_at = NOW()
    RETURNING
      id,
      user_id,
      plan,
      status,
      billing_cycle,
      amount_paid,
      last_payment_method,
      last_payment_reference,
      TO_CHAR(started_at, 'YYYY-MM-DD HH24:MI:SS') AS started_at,
      TO_CHAR(ends_at,    'YYYY-MM-DD HH24:MI:SS') AS ends_at,
      TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at,
      TO_CHAR(updated_at, 'YYYY-MM-DD HH24:MI:SS') AS updated_at
    `,
    [
      user_id,
      plan,
      status,
      billing_cycle,
      amount_paid,
      last_payment_method,
      last_payment_reference,
      started_at,
      ends_at,
    ]
  )
  return result.rows[0]
}

export const updateSubscriptionStatus = async (userId, status) => {
  const result = await pool.query(
    `
    UPDATE subscriptions
    SET status = $1, updated_at = NOW()
    WHERE user_id = $2
    RETURNING id, user_id, plan, status
    `,
    [status, userId]
  )
  return result.rows[0]
}

export const recordSubscriptionPayment = async ({
  user_id,
  plan,
  billing_cycle,
  amount,
  payment_method,
  payment_reference,
  status = 'success',
  is_simulation = true,
}) => {
  const result = await pool.query(
    `
    INSERT INTO subscription_payments (
      user_id, plan, billing_cycle, amount,
      payment_method, payment_reference,
      status, is_simulation, paid_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
    RETURNING
      id,
      user_id,
      plan,
      billing_cycle,
      amount,
      payment_method,
      payment_reference,
      status,
      is_simulation,
      TO_CHAR(paid_at, 'YYYY-MM-DD HH24:MI:SS') AS paid_at
    `,
    [
      user_id,
      plan,
      billing_cycle,
      amount,
      payment_method,
      payment_reference,
      status,
      is_simulation,
    ]
  )
  return result.rows[0]
}

export const getPaymentHistoryByUser = async (userId, limit = 20) => {
  const result = await pool.query(
    `
    SELECT
      id,
      plan,
      billing_cycle,
      amount,
      payment_method,
      payment_reference,
      status,
      is_simulation,
      TO_CHAR(paid_at, 'YYYY-MM-DD HH24:MI:SS') AS paid_at
    FROM subscription_payments
    WHERE user_id = $1
    ORDER BY paid_at DESC
    LIMIT $2
    `,
    [userId, limit]
  )
  return result.rows
}
