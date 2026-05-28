import pool from '../config/db.js'

const daysLeftSQL = `
  GREATEST(
    CEIL(
      EXTRACT(
        EPOCH FROM (
          i.expiry_date::timestamp - CURRENT_DATE::timestamp
        )
      ) / 86400
    ),
    0
  )::int
`

const statusSQL = `
  CASE
    WHEN GREATEST(
      CEIL(
        EXTRACT(
          EPOCH FROM (
            expiry_date::timestamp - CURRENT_DATE::timestamp
          )
        ) / 86400
      ),
      0
    ) <= 2 THEN 'high'

    WHEN GREATEST(
      CEIL(
        EXTRACT(
          EPOCH FROM (
            expiry_date::timestamp - CURRENT_DATE::timestamp
          )
        ) / 86400
      ),
      0
    ) <= 5 THEN 'warning'

    ELSE 'fresh'
  END
`

export const refreshInventoryStatuses = async (userId) => {
  const result = await pool.query(
    ` WITH updated AS (
        UPDATE inventories i
        SET
          status = ${statusSQL},
          updated_at = CURRENT_TIMESTAMP
        WHERE i.user_id = $1
          AND i.quantity > 0
          AND i.status IS DISTINCT FROM ${statusSQL}
        RETURNING
          i.id,
          i.user_id,
          i.food_name,
          i.status,
          TO_CHAR(i.expiry_date, 'YYYY-MM-DD') AS expiry_date
      )
      SELECT * FROM updated
    `, [userId]
  )
  return result.rows
}

export const createInventory = async ({ user_id, food_name, quantity, unit, purchase_date, expiry_date, storage_location, category, shelf_life, status }) => {
  const result = await pool.query(
    ` INSERT INTO inventories
        (user_id, food_name, quantity, unit, purchase_date, expiry_date, storage_location, category, shelf_life, status)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING
        id,
        user_id,
        food_name,
        quantity,
        unit,
        TO_CHAR(purchase_date, 'YYYY-MM-DD') AS purchase_date,
        TO_CHAR(expiry_date, 'YYYY-MM-DD') AS expiry_date,
        storage_location,
        category,
        shelf_life,
        status,
        TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at
    `, [user_id, food_name, quantity, unit, purchase_date, expiry_date, storage_location, category, shelf_life, status]
  )
  return result.rows[0]
}

export const getInventories = async (userId, filters = {}) => {
  const values = [userId]

  const conditions = [
    'i.user_id = $1',
    'i.quantity > 0',
  ]

  if (filters.category) {
    values.push(filters.category.toLowerCase())
    conditions.push(`LOWER(i.category) = $${values.length}`)
  }

  if (filters.status) {
    values.push(filters.status.toLowerCase())
    conditions.push(`LOWER(i.status) = $${values.length}`)
  }

  if (filters.search) {
    values.push(`%${filters.search.toLowerCase()}%`)
    conditions.push(`LOWER(i.food_name) LIKE $${values.length}`)
  }

  const result = await pool.query(
    ` SELECT
        i.id,
        i.user_id,
        i.food_name,
        i.quantity,
        i.unit,
        i.category,
        i.storage_location,
        TO_CHAR(i.purchase_date, 'YYYY-MM-DD') AS purchase_date,
        TO_CHAR(i.expiry_date, 'YYYY-MM-DD') AS expiry_date,
        i.shelf_life,
        i.status,
        ${daysLeftSQL} AS days_left,
        TO_CHAR(i.created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at,
        TO_CHAR(i.updated_at, 'YYYY-MM-DD HH24:MI:SS') AS updated_at
      FROM inventories i
      WHERE ${conditions.join(' AND ')}
      ORDER BY
        CASE
          WHEN i.status = 'high' THEN 1
          WHEN i.status = 'warning' THEN 2
          WHEN i.status = 'fresh' THEN 3
          ELSE 4
        END,
        i.expiry_date ASC,
        i.created_at DESC
    `, values
  )
  return result.rows
}

export const getInventoryById = async (id, userId) => {
  const result = await pool.query(
    ` SELECT
        i.id,
        i.user_id,
        i.food_name,
        i.quantity,
        i.unit,
        i.category,
        i.storage_location,
        TO_CHAR(i.purchase_date, 'YYYY-MM-DD') AS purchase_date,
        TO_CHAR(i.expiry_date, 'YYYY-MM-DD') AS expiry_date,
        i.shelf_life,
        i.status,
        ${daysLeftSQL} AS days_left,
        TO_CHAR(i.created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at,
        TO_CHAR(i.updated_at, 'YYYY-MM-DD HH24:MI:SS') AS updated_at
      FROM inventories i
      WHERE i.id = $1
        AND i.user_id = $2
    `, [id, userId]
  )
  return result.rows[0]
}

export const updateInventory = async (id, userId, { food_name, quantity, unit, purchase_date, expiry_date, storage_location, category, shelf_life, status }) => {
  const result = await pool.query(
    ` UPDATE inventories
      SET
        food_name = $1,
        quantity = $2,
        unit = $3,
        purchase_date = $4,
        expiry_date = $5,
        storage_location = $6,
        category = $7,
        shelf_life = $8,
        status = $9,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
        AND user_id = $11
      RETURNING
        id,
        user_id,
        food_name,
        quantity,
        unit,
        TO_CHAR(purchase_date, 'YYYY-MM-DD') AS purchase_date,
        TO_CHAR(expiry_date, 'YYYY-MM-DD') AS expiry_date,
        storage_location,
        category,
        shelf_life,
        status,
        TO_CHAR(updated_at, 'YYYY-MM-DD HH24:MI:SS') AS updated_at
    `, [food_name, quantity, unit, purchase_date, expiry_date, storage_location, category, shelf_life, status, id, userId]
  )
  return result.rows[0]
}

export const deleteInventory = async (id, userId) => {
  const result = await pool.query(
    ` DELETE FROM inventories WHERE id = $1 AND user_id = $2
      RETURNING id
    `,[id, userId]
  )
  return result.rows[0]
}

export const updateInventoryStatus = async (client, inventoryId, status) => {
  await client.query(
    ` UPDATE inventories
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [status, inventoryId]
  )
}

export const updateInventoryStatusById = async (inventoryId, status) => {
  const result = await pool.query(
    ` UPDATE inventories
      SET
        status = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING
        id,
        user_id,
        food_name,
        status,
        TO_CHAR(expiry_date, 'YYYY-MM-DD') AS expiry_date
    `, [status, inventoryId]
  )
  return result.rows[0]
}