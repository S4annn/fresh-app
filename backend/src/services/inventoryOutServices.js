import pool from '../config/db.js';
import { checkInventoryOwner, createInventoryOut, reduceInventoryStock, getInventoryOuts } from '../models/InventoryOutModel.js';
import { updateInventoryStatus } from '../models/inventoryModel.js';

export const useInventory = async (inventoryId, userId, body) => {
  const inventory = await checkInventoryOwner(inventoryId, userId);

  if (!inventory) {
    const error = new Error('Inventory tidak ditemukan');
    error.statusCode = 404;
    throw error;
  }

  const quantity = Number(body.quantity);

  if (quantity > Number(inventory.quantity)) {
    const error = new Error('Stock tidak mencukupi');
    error.statusCode = 400;
    throw error;
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const result = await createInventoryOut(client, {
      inventory_id: inventoryId,
      user_id: userId,
      quantity,
      out_type: 'used',
      notes: body.notes || null,
    });

    const updatedInventory = await reduceInventoryStock(
      client,
      inventoryId,
      quantity
    );

    if (!updatedInventory) {
      const error = new Error('Stock tidak mencukupi');
      error.statusCode = 400;
      throw error;
    }

    if (Number(updatedInventory.quantity) <= 0) {
      await updateInventoryStatus(client, inventoryId, 'empty');
    }

    await client.query('COMMIT');

    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const getAllInventoryOuts = async (userId) => {
  return await getInventoryOuts(userId);
};
