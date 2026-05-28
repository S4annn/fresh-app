import pool from '../config/db.js';

export const getPersonalDashboardStats = async (userId) => {
  const result = await pool.query(
    ` SELECT
        COUNT(*)::int AS total_inventory,
        COUNT(CASE WHEN status = 'high' THEN 1 END)::int AS total_high,
        COUNT(CASE WHEN status = 'warning' THEN 1 END)::int AS total_warning
      FROM inventories
      WHERE user_id = $1
        AND quantity > 0
    `, [userId]
  );
  return result.rows[0];
};

export const getLatestInventoryItems = async (userId) => {
  const result = await pool.query(
    ` SELECT
        id,
        food_name,
        quantity,
        unit,
        category,
        storage_location,
        status,
        TO_CHAR(purchase_date, 'YYYY-MM-DD') AS purchase_date,
        TO_CHAR(expiry_date, 'YYYY-MM-DD') AS expiry_date,
        GREATEST(
          CEIL(
            EXTRACT(
              EPOCH FROM (
                expiry_date::timestamp - CURRENT_DATE::timestamp
              )
            ) / 86400
          ), 0
        )::int AS days_left,
        TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at
      FROM inventories
      WHERE user_id = $1
        AND quantity > 0
      ORDER BY created_at DESC
      LIMIT 5
    `, [userId]
  );
  return result.rows;
};

export const getBusinessDashboardStats = async (sellerId) => {
  const result = await pool.query(
    ` SELECT
        (
          SELECT COUNT(*)::int
          FROM products
          WHERE seller_id = $1
        ) AS total_products,

        (
          SELECT COUNT(DISTINCT t.id)::int
          FROM transactions t
          JOIN transaction_items ti ON ti.transaction_id = t.id
          JOIN products p ON p.id = ti.product_id
          WHERE p.seller_id = $1
        ) AS total_orders
    `, [sellerId]
  );
  return result.rows[0];
};

export const getBusinessDashboardProducts = async (sellerId) => {
  const result = await pool.query(
    ` SELECT
        id,
        product_name,
        category,
        description,
        TO_CHAR(expiry_date, 'YYYY-MM-DD') AS expiry_date,
        price,
        stock,
        status,
        TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at
      FROM products
      WHERE seller_id = $1
      ORDER BY created_at DESC
      LIMIT 5
    `, [sellerId]
  );
  return result.rows;
};

export const getBusinessDashboardOrders = async (sellerId) => {
  const result = await pool.query(
    ` SELECT
        t.id,
        t.transaction_code,
        t.buyer_id,
        buyer.name AS buyer_name,
        t.status,
        SUM(ti.quantity)::int AS total_items,
        SUM(ti.subtotal) AS total_price,
        TO_CHAR(t.created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at
      FROM transactions t
      JOIN users buyer ON buyer.id = t.buyer_id
      JOIN transaction_items ti ON ti.transaction_id = t.id
      JOIN products p ON p.id = ti.product_id
      WHERE p.seller_id = $1
      GROUP BY
        t.id,
        t.transaction_code,
        t.buyer_id,
        buyer.name,
        t.status,
        t.created_at
      ORDER BY t.created_at DESC
      LIMIT 5
    `, [sellerId]
  );
  return result.rows;
};