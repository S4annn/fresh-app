import { useInventory, getAllInventoryOuts } from '../services/inventoryOutServices.js';

export const create = async (req, res, next) => {
  try {
    const data = await useInventory(
      req.params.inventoryId,
      req.user.id,
      req.body
    );

    res.status(201).json({
      status: 'success',
      message: 'Inventory berhasil digunakan',
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const data = await getAllInventoryOuts(req.user.id);

    res.json({
      status: 'success',
      data,
    });
  } catch (err) {
    next(err);
  }
};
