import { addProduct, getAllProducts, getDetailProduct, getMyProducts, editProduct, editProductStatus, removeProduct } from '../services/productServices.js';

export const create = async (req, res, next) => {
  try {
    const data = await addProduct(
      req.user.id,
      req.body
    );

    res.status(201).json({
      status: 'success',
      message: 'Produk berhasil ditambahkan',
      data,
    });

  } catch (err) {
    next(err);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const filters = {
      search: req.query.search,
    };

    const data = await getAllProducts(
      req.user.id,
      filters
    );

    res.json({
      status: 'success',
      total: data.length,
      data,
    });

  } catch (err) {
    next(err);
  }
};

export const getOne = async (req, res, next) => {
  try {
    const data = await getDetailProduct(
      req.params.id
    );

    res.json({
      status: 'success',
      data,
    });

  } catch (err) {
    next(err);
  }
};

export const getMine = async (req, res, next) => {
  try {
    const filters = {
      search: req.query.search,
    };

    const data = await getMyProducts(
      req.user.id,
      filters
    );

    res.json({
      status: 'success',
      total: data.length,
      data,
    });

  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const data = await editProduct(
      req.params.id,
      req.user.id,
      req.body
    );

    res.json({
      status: 'success',
      message: 'Produk berhasil diperbarui',
      data,
    });

  } catch (err) {
    next(err);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const data = await editProductStatus(
      req.params.id,
      req.user.id,
      req.body.status
    );

    res.json({
      status: 'success',
      message: 'Status produk berhasil diperbarui',
      data,
    });

  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    await removeProduct(
      req.params.id,
      req.user.id
    );

    res.json({
      status: 'success',
      message: 'Produk berhasil dihapus',
    });

  } catch (err) {
    next(err);
  }
};