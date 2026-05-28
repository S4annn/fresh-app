import { createProduct, getMarketplaceProducts, getProductById, getProductsBySeller, updateProduct, updateProductStatus, deleteProduct } from '../models/productModel.js';

export const addProduct = async (sellerId, data) => {
  return await createProduct(
    sellerId,
    data
  );
};

export const getAllProducts = async (viewerId, filters = {}) => {
  return await getMarketplaceProducts(
    viewerId,
    filters
  );
};

export const getDetailProduct = async (id) => {
  const product = await getProductById(id);

  if (!product) {
    const error = new Error('Produk tidak ditemukan');
    error.statusCode = 404;
    throw error;
  }
  return product;
};

export const getMyProducts = async (sellerId, filters = {}) => {
  return await getProductsBySeller(
    sellerId,
    filters
  );
};

export const editProduct = async (id, sellerId, data) => {
  const product = await updateProduct(
    id,
    sellerId,
    data
  );

  if (!product) {
    const error = new Error('Produk tidak ditemukan atau bukan milik user');
    error.statusCode = 404;
    throw error;
  }

  return product;
};

export const editProductStatus = async (id, sellerId, status) => {
  const product = await updateProductStatus(
    id,
    sellerId,
    status
  );

  if (!product) {
    const error = new Error('Produk tidak ditemukan atau bukan milik user');
    error.statusCode = 404;
    throw error;
  }

  return product;
};

export const removeProduct = async (id, sellerId) => {
  const product = await deleteProduct(
    id,
    sellerId
  );

  if (!product) {
    const error = new Error('Produk tidak ditemukan atau bukan milik user');
    error.statusCode = 404;
    throw error;
  }

  return product;
};