import { createInventory, getInventories, getInventoryById, updateInventory, deleteInventory, refreshInventoryStatuses } from '../models/inventoryModel.js'
import { createNotification } from '../models/notificationModel.js'

const calculateExpiryDate = (purchaseDate, shelfLife) => {
  const expiryDate = new Date(purchaseDate)
  expiryDate.setDate(expiryDate.getDate() + Number(shelfLife))

  return expiryDate
}

const calculateStatus = (expiryDate) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const expired = new Date(expiryDate)
  expired.setHours(0, 0, 0, 0)

  const diffDays = Math.ceil(
    (expired - today) / (1000 * 60 * 60 * 24)
  )
  
  if (diffDays <= 2) return 'high'
  if (diffDays <= 5) return 'warning'

  return 'fresh'
}

const getAIInventoryPrediction = async (data) => {
  if (!process.env.AI_PREDICT_RISK_URL) {
    const error = new Error('AI_PREDICT_RISK_URL belum diset')
    error.statusCode = 500
    throw error
  }

  const controller = new AbortController()

  const timeout = setTimeout(() => {
    controller.abort()
  }, 10000)

  try {
    const response = await fetch(
      process.env.AI_PREDICT_RISK_URL.trim(),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          food_name: data.food_name,
          category: data.category,
          quantity: Number(data.quantity),
          unit: data.unit,
          purchase_date: data.purchase_date,
          storage_condition: data.storage_location,
          storage_type: data.storage_location,
        }),
      }
    )

    clearTimeout(timeout)

    if (!response.ok) {
      const text = await response.text()

      const error = new Error(
        `Gagal mendapatkan prediksi AI: ${text}`
      )

      error.statusCode = 502
      throw error
    }

    const result = await response.json()

    const shelf_life = Number(result.shelf_life)

    if (!shelf_life || shelf_life <= 0) {
      const error = new Error(
        'Response AI tidak memiliki shelf_life yang valid'
      )

      error.statusCode = 502
      throw error
    }

    const expiry_date = calculateExpiryDate(
      data.purchase_date,
      shelf_life
    )

    const status = calculateStatus(expiry_date)

    return {
      shelf_life,
      expiry_date,
      status,
    }
  } catch (error) {
    clearTimeout(timeout)

    if (error.name === 'AbortError') {
      const timeoutError = new Error(
        'AI service timeout / terlalu lama merespons'
      )

      timeoutError.statusCode = 504
      throw timeoutError
    }

    throw error
  }
}

export const addInventory = async (userId, data) => {
  const prediction = await getAIInventoryPrediction(data)

  return await createInventory({
    user_id: userId,
    food_name: data.food_name,
    quantity: data.quantity,
    unit: data.unit,
    purchase_date: data.purchase_date,
    expiry_date: prediction.expiry_date,
    storage_location: data.storage_location,
    category: data.category,
    shelf_life: prediction.shelf_life,
    status: prediction.status,
  })
}

export const getAllInventories = async (userId, filters = {}) => {
  const changedItems = await refreshInventoryStatuses(userId)

  for (const item of changedItems) {
    await createStatusChangeNotification(item)
  }

  return await getInventories(userId, filters)
}

export const getDetailInventory = async (id, userId) => {
  const inventory = await getInventoryById(id, userId)

  if (!inventory) {
    const error = new Error('Inventory tidak ditemukan')
    error.statusCode = 404
    throw error
  }

  return inventory
}

export const editInventory = async (id, userId, data) => {
  const prediction = await getAIInventoryPrediction(data)

  const inventory = await updateInventory(id, userId, {
    food_name: data.food_name,
    quantity: data.quantity,
    unit: data.unit,
    purchase_date: data.purchase_date,
    expiry_date: prediction.expiry_date,
    storage_location: data.storage_location,
    category: data.category,
    shelf_life: prediction.shelf_life,
    status: prediction.status,
  })

  if (!inventory) {
    const error = new Error('Inventory tidak ditemukan')
    error.statusCode = 404
    throw error
  }

  return inventory
}

export const removeInventory = async (id, userId) => {
  const inventory = await deleteInventory(id, userId)

  if (!inventory) {
    const error = new Error('Inventory tidak ditemukan')
    error.statusCode = 404
    throw error
  }

  return inventory
}

const createStatusChangeNotification = async (item) => {
  let title = 'Status Inventory Berubah'
  let message = `Status ${item.food_name} berubah menjadi ${item.status}`

  if (item.status === 'high') {
    title = 'Inventory Hampir Kedaluwarsa'
    message = `${item.food_name} harus segera digunakan. Kedaluwarsa pada ${item.expiry_date}`
  }

  if (item.status === 'warning') {
    title = 'Inventory Perlu Diperhatikan'
    message = `${item.food_name} mulai mendekati tanggal kedaluwarsa. Kedaluwarsa pada ${item.expiry_date}`
  }

  await createNotification({
    user_id: item.user_id,
    title,
    message,
  })
}