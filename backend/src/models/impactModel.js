import pool from '../config/db.js'

/**
 * Aggregate "food saved" metrics for a user.
 *
 * Sources of saved food:
 *   - inventories_out  → quantity actually used by the household
 *   - donations        → completed donations (qty - remaining_qty)
 */
export const getPersonalImpactStats = async (userId) => {
  const result = await pool.query(
    `
    WITH used AS (
      SELECT COALESCE(SUM(io.quantity), 0)::numeric AS total_used
      FROM inventories_out io
      WHERE io.user_id = $1
    ),
    donated AS (
      SELECT
        COALESCE(SUM(d.quantity - COALESCE(d.remaining_quantity, 0)), 0)::numeric AS total_donated,
        COUNT(*)::int AS donation_count
      FROM donations d
      WHERE d.user_id = $1
    ),
    requests_received AS (
      SELECT COUNT(*)::int AS approved_donation_requests
      FROM donation_requests dr
      JOIN donations d ON d.id = dr.donation_id
      WHERE d.user_id = $1
        AND dr.status = 'approved'
    ),
    inventory_breakdown AS (
      SELECT
        COUNT(*)::int AS total_inventory,
        COUNT(*) FILTER (WHERE status = 'high')::int AS total_high,
        COUNT(*) FILTER (WHERE status = 'warning')::int AS total_warning,
        COUNT(*) FILTER (WHERE status = 'fresh')::int AS total_fresh
      FROM inventories
      WHERE user_id = $1
        AND quantity > 0
    ),
    by_category AS (
      SELECT
        COALESCE(NULLIF(category, ''), 'lainnya') AS category,
        COUNT(*)::int AS count
      FROM inventories
      WHERE user_id = $1
        AND quantity > 0
      GROUP BY 1
      ORDER BY count DESC
    )
    SELECT
      (SELECT total_used FROM used) AS total_used,
      (SELECT total_donated FROM donated) AS total_donated,
      (SELECT donation_count FROM donated) AS donation_count,
      (SELECT approved_donation_requests FROM requests_received)
        AS approved_donation_requests,
      (SELECT total_inventory FROM inventory_breakdown) AS total_inventory,
      (SELECT total_high FROM inventory_breakdown) AS total_high,
      (SELECT total_warning FROM inventory_breakdown) AS total_warning,
      (SELECT total_fresh FROM inventory_breakdown) AS total_fresh,
      (SELECT json_agg(by_category) FROM by_category) AS category_breakdown
    `,
    [userId]
  )

  return result.rows[0] || {}
}

export const getBusinessImpactStats = async (sellerId) => {
  const result = await pool.query(
    `
    WITH sales AS (
      SELECT
        COALESCE(SUM(ti.quantity), 0)::numeric AS total_units_sold,
        COALESCE(SUM(ti.subtotal), 0)::numeric AS total_revenue,
        COUNT(DISTINCT t.id)::int AS total_orders
      FROM transactions t
      JOIN transaction_items ti ON ti.transaction_id = t.id
      JOIN products p ON p.id = ti.product_id
      WHERE p.seller_id = $1
        AND t.status = 'selesai'
    ),
    products_status AS (
      SELECT
        COUNT(*)::int AS total_products,
        COUNT(*) FILTER (WHERE COALESCE(stock, 0) > 0)::int AS available_products,
        COUNT(*) FILTER (WHERE COALESCE(stock, 0) = 0)::int AS sold_out_products
      FROM products
      WHERE seller_id = $1
    ),
    expiring_soon AS (
      SELECT COUNT(*)::int AS expiring_count
      FROM products
      WHERE seller_id = $1
        AND expiry_date IS NOT NULL
        AND expiry_date <= CURRENT_DATE + INTERVAL '5 days'
        AND COALESCE(stock, 0) > 0
    )
    SELECT
      (SELECT total_units_sold FROM sales) AS total_units_sold,
      (SELECT total_revenue FROM sales) AS total_revenue,
      (SELECT total_orders FROM sales) AS total_orders,
      (SELECT total_products FROM products_status) AS total_products,
      (SELECT available_products FROM products_status) AS available_products,
      (SELECT sold_out_products FROM products_status) AS sold_out_products,
      (SELECT expiring_count FROM expiring_soon) AS expiring_count
    `,
    [sellerId]
  )

  return result.rows[0] || {}
}
