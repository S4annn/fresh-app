import { addInventory, getAllInventories, editInventory, removeInventory, getDetailInventory } from '../services/inventoryServices.js'

export const create = async (req, res, next) => {
  try {
    const data = await addInventory(
      req.user.id,
      req.body
    )

    res.status(201).json({
      status: 'success',
      message: 'Inventory berhasil ditambahkan',
      data,
    })
  } catch (err) {
    next(err)
  }
}

export const getAll = async (req, res, next) => {
  try {
    const filters = {
      category: req.query.category,
      status: req.query.status,
      search: req.query.search,
    }

    const data = await getAllInventories(
      req.user.id,
      filters
    )

    res.json({
      status: 'success',
      total: data.length,
      data,
    })
  } catch (err) {
    next(err)
  }
}

export const getOne = async (req, res, next) => {
  try {
    const data = await getDetailInventory(
      req.params.id,
      req.user.id
    )

    res.json({
      status: 'success',
      data,
    })
  } catch (err) {
    next(err)
  }
}

export const update = async (req, res, next) => {
  try {
    const data = await editInventory(
      req.params.id,
      req.user.id,
      req.body
    )

    res.json({
      status: 'success',
      message: 'Inventory berhasil diupdate',
      data,
    })
  } catch (err) {
    next(err)
  }
}

export const remove = async (req, res, next) => {
  try {
    await removeInventory(
      req.params.id,
      req.user.id
    )

    res.json({
      status: 'success',
      message: 'Inventory berhasil dihapus',
    })
  } catch (err) {
    next(err)
  }
}