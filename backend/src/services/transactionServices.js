import {
  createTransactionWithItems,
  getBuyerTransactions,
  getSellerTransactions,
  getTransactionDetail,
  updateTransactionStatus,
} from '../models/transactionModel.js'

import {
  createNotification,
} from '../models/notificationModel.js'

export const createTransactionService = async (
  buyerId,
  items
) => {
  const transactions =
    await createTransactionWithItems(
      buyerId,
      items
    )

  for (const transaction of transactions) {
    await createNotification({
      user_id: transaction.seller_id,
      title: 'Pesanan Baru',
      message:
        `Pesanan baru ${transaction.transaction_code}`,
    })
  }

  return transactions
}

export const getMyOrdersService = async (
  buyerId
) => {
  return await getBuyerTransactions(
    buyerId
  )
}

export const getSalesService = async (
  sellerId
) => {
  return await getSellerTransactions(
    sellerId
  )
}

export const getTransactionDetailService = async (
  transactionId,
  userId
) => {
  const transaction =
    await getTransactionDetail(
      transactionId,
      userId
    )

  if (!transaction) {
    const error = new Error(
      'Transaksi tidak ditemukan'
    )

    error.statusCode = 404

    throw error
  }

  return transaction
}

export const updateTransactionStatusService = async (transactionId, sellerId, status) => {
  // Verify seller owns this transaction
  const detail = await getTransactionDetail(transactionId, sellerId)

  if (!detail) {
    const error = new Error('Transaksi tidak ditemukan atau bukan milik Anda')
    error.statusCode = 404
    throw error
  }

  const transaction = await updateTransactionStatus(
    transactionId,
    status
  )

  if (!transaction) {
    const error = new Error('Transaksi tidak ditemukan')
    error.statusCode = 404
    throw error
  }

  let title = 'Status Pesanan Berubah'
  let message =
    `Pesanan ${transaction.transaction_code} ${status}`

  if (status === 'diproses') {
    title = 'Pesanan Diproses'
    message =
      `Pesanan ${transaction.transaction_code} sedang diproses. ` +
      `Silakan segera ambil orderan di ${transaction.store_name || transaction.seller_name || 'toko'}. ` +
      `Alamat: ${transaction.seller_address || '-'}`
  }

  if (status === 'selesai') {
    title = 'Pesanan Selesai'
    message =
      `Pesanan ${transaction.transaction_code} telah selesai.`
  }

  if (status === 'dibatalkan') {
    title = 'Pesanan Dibatalkan'
    message =
      `Pesanan ${transaction.transaction_code} dibatalkan.`
  }

  await createNotification({
    user_id: transaction.buyer_id,
    title,
    message,
  })

  return transaction
}