import pool from '../config/db.js';

export const checkInventoryOwner = async (inventoryId, userId) => {
  const result = await pool.query(
    ` SELECT * FROM inventories
      WHERE id = $1 AND user_id = $2
    `, [inventoryId, userId]
  );
  return result.rows[0];
};

export const createInventoryOut = async (client, data) => {
  const result = await client.query(
    ` INSERT INTO inventories_out
        (inventory_id, user_id, quantity, out_type, notes)
      VALUES ($1,$2,$3,$4,$5)
      RETURNING
        id,
        inventory_id,
        user_id,
        quantity,
        out_type,
        notes,
        TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at
    `, [data.inventory_id, data.user_id, data.quantity, data.out_type, data.notes]
  );
  return result.rows[0];
};

export const reduceInventoryStock = async (client, inventoryId, quantity) => {
  const result = await client.query(
    ` UPDATE inventories
      SET
        quantity = quantity - $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
        AND quantity >= $1
      RETURNING quantity
    `, [quantity, inventoryId]
  );
  return result.rows[0];
};

export const getInventoryOuts = async (userId) => {
  const result = await pool.query(
    ` SELECT
        io.id,
        io.inventory_id,
        i.food_name,
        io.quantity,
        i.unit,
        io.out_type,
        io.notes,
        TO_CHAR(io.created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at
      FROM inventories_out io
      JOIN inventories i
        ON i.id = io.inventory_id
      WHERE io.user_id = $1
      ORDER BY io.created_at DESC
    `, [userId]
  );
  return result.rows;
};
