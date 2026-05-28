import { createTransactionService, getMyOrdersService, getSalesService, getTransactionDetailService, updateTransactionStatusService } from '../services/transactionServices.js'

export const create = async (req, res, next) => {
  try {
    const data = await createTransactionService(
      req.user.id,
      req.body.items
    )

    res.status(201).json({
      status: 'success',
      message: 'Pesanan berhasil dibuat',
      total: data.length,
      data,
    })
  } catch (err) {
    next(err)
  }
}

export const getMyOrders = async (req, res, next) => {
  try {
    const data = await getMyOrdersService(
      req.user.id
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

export const getSales = async (req, res, next) => {
  try {
    const data = await getSalesService(
      req.user.id
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

export const getDetail = async (req, res, next) => {
  try {
    const data = await getTransactionDetailService(
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

export const updateStatus = async (req, res, next) => {
  try {
    const data = await updateTransactionStatusService(
      req.params.id,
      req.user.id,
      req.body.status
    )

    res.json({
      status: 'success',
      message: 'Status pesanan diperbarui',
      data,
    })
  } catch (err) {
    next(err)
  }
}