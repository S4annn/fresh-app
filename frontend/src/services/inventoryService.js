import api from './api'

export async function getInventory(filters = {}) {
  try {
    const response = await api.get('/inventories', {
      params: filters,
    })

    return response.data.data || []
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        'Gagal mengambil data inventory'
    )
  }
}

export async function getInventoryById(id) {
  try {
    const response = await api.get(
      `/inventories/${id}`
    )

    return response.data.data
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        'Gagal mengambil detail inventory'
    )
  }
}

export async function addInventory(itemData) {
  try {
    const response = await api.post(
      '/inventories',
      {
        food_name: itemData.food_name,
        quantity: Number(itemData.quantity),
        unit: itemData.unit,
        category: itemData.category,
        storage_location: itemData.storage_location,
        purchase_date: itemData.purchase_date,
      }
    )

    return response.data.data
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        'Gagal menambahkan inventory'
    )
  }
}

export async function updateInventory(id, itemData) {
  try {
    const response = await api.put(
      `/inventories/${id}`,
      {
        food_name: itemData.food_name,
        quantity: Number(itemData.quantity),
        unit: itemData.unit,
        category: itemData.category,
        storage_location: itemData.storage_location,
        purchase_date: itemData.purchase_date,
      }
    )

    return response.data.data
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        'Gagal mengupdate inventory'
    )
  }
}

export async function deleteInventory(id) {
  try {
    const response = await api.delete(
      `/inventories/${id}`
    )

    return response.data
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        'Gagal menghapus inventory'
    )
  }
}