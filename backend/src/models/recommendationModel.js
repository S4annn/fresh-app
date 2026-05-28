import pool from '../config/db.js';

export const getPriorityInventories = async (userId) => {
  const result = await pool.query(
    `
    SELECT
      id,
      food_name,
      quantity,
      unit,
      category,
      storage_location,
      status,
      TO_CHAR(expiry_date, 'YYYY-MM-DD') AS expiry_date,
      GREATEST(
        CEIL(
          EXTRACT(EPOCH FROM (
            expiry_date::timestamp - CURRENT_DATE::timestamp
          )) / 86400
        ),
        0
      )::int AS days_left
    FROM inventories
    WHERE user_id = $1
      AND quantity > 0
      AND status IN ('high', 'warning')
    ORDER BY
      CASE
        WHEN status = 'high' THEN 1
        WHEN status = 'warning' THEN 2
        ELSE 3
      END,
      expiry_date ASC
    `,
    [userId]
  );

  return result.rows;
};

export const getAllUserInventories = async (userId) => {
  const result = await pool.query(
    `
    SELECT
      id,
      food_name,
      quantity,
      unit,
      category,
      storage_location,
      status,
      TO_CHAR(expiry_date, 'YYYY-MM-DD') AS expiry_date,
      GREATEST(
        CEIL(
          EXTRACT(EPOCH FROM (
            expiry_date::timestamp - CURRENT_DATE::timestamp
          )) / 86400
        ),
        0
      )::int AS days_left
    FROM inventories
    WHERE user_id = $1
      AND quantity > 0
    ORDER BY expiry_date ASC
    `,
    [userId]
  );

  return result.rows;
};