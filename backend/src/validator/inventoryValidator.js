import Joi from 'joi'

export const createInventorySchema = Joi.object({
  food_name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'any.required': 'Nama makanan wajib diisi',
      'string.empty': 'Nama makanan tidak boleh kosong',
    }),

  quantity: Joi.number()
    .positive()
    .required()
    .messages({
      'any.required': 'Jumlah wajib diisi',
      'number.positive': 'Jumlah harus lebih dari 0',
    }),

  unit: Joi.string()
    .valid(
      'pcs',
      'kg',
      'gram',
      'liter',
      'ml',
      'pack',
      'box'
    )
    .required()
    .messages({
      'any.required': 'Satuan wajib diisi',
      'any.only': 'Satuan tidak valid',
    }),

  purchase_date: Joi.date()
    .iso()
    .required()
    .messages({
      'any.required': 'Tanggal pembelian wajib diisi',
    }),

  storage_location: Joi.string()
    .valid(
      'Kulkas',
      'Freezer',
      'Suhu ruang'
    )
    .required()
    .messages({
      'any.required': 'Lokasi penyimpanan wajib diisi',
      'any.only': 'Lokasi penyimpanan tidak valid',
    }),

  category: Joi.string()
    .max(50)
    .required()
    .messages({
      'any.required': 'Kategori wajib diisi',
    }),
})

export const updateInventorySchema = Joi.object({
  food_name: Joi.string()
    .min(2)
    .max(100)
    .required(),

  quantity: Joi.number()
    .positive()
    .required(),

  unit: Joi.string()
    .valid(
      'pcs',
      'kg',
      'gram',
      'liter',
      'ml',
      'pack',
      'box'
    )
    .required(),

  purchase_date: Joi.date()
    .iso()
    .required(),

  storage_location: Joi.string()
    .valid(
      'Kulkas',
      'Freezer',
      'Suhu ruang'
    )
    .required(),

  category: Joi.string()
    .max(50)
    .required(),
})

export const inventoryFilterSchema = Joi.object({
  category: Joi.string()
    .max(50)
    .optional(),

  status: Joi.string()
    .valid(
      'fresh',
      'warning',
      'high',
      'empty'
    )
    .optional(),

  search: Joi.string()
    .max(100)
    .optional(),
})