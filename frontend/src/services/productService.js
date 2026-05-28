import api from './api'

export async function getMarketplaceProducts(filters = {}) {
  try {
    const response = await api.get('/products', {
      params: filters,
    })

    return response.data.data || []
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        'Gagal mengambil produk marketplace'
    )
  }
}

export async function getProductDetail(id) {
  try {
    const response = await api.get(`/products/${id}`)

    return response.data.data
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        'Gagal mengambil detail produk'
    )
  }
}

export async function getMyProducts(filters = {}) {
  try {
    const response = await api.get('/products/my-products', {
      params: filters,
    })

    return response.data.data || []
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        'Gagal mengambil produk saya'
    )
  }
}

export async function addProduct(productData) {
  try {
    const payload = {
      product_name: productData.product_name,
      category: productData.category,
      description: productData.description || '',
      expiry_date: productData.expiry_date,
      price: Number(productData.price),
      stock: Number(productData.stock),
      unit: productData.unit,
    }

    const response = await api.post('/products', payload)

    return response.data.data
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        'Gagal menambahkan produk'
    )
  }
}

export async function updateProduct(id, productData) {
  try {
    const payload = {
      product_name: productData.product_name,
      category: productData.category,
      description: productData.description || '',
      expiry_date: productData.expiry_date,
      price: Number(productData.price),
      stock: Number(productData.stock),
      unit: productData.unit,
      status: productData.status || 'tersedia',
    }

    const response = await api.put(`/products/${id}`, payload)

    return response.data.data
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        'Gagal mengubah produk'
    )
  }
}

export async function updateProductStatus(id, status) {
  try {
    const response = await api.patch(`/products/${id}/status`, {
      status,
    })

    return response.data.data
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        'Gagal mengubah status produk'
    )
  }
}

export async function deleteProduct(id) {
  try {
    const response = await api.delete(`/products/${id}`)

    return response.data
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        'Gagal menghapus produk'
    )
  }
}