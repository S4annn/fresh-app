import Joi from 'joi';

export const createProductSchema =
  Joi.object({

    product_name:
      Joi.string()
        .min(2)
        .max(150)
        .required(),

    category:
      Joi.string()
        .max(50)
        .required(),

    description:
      Joi.string()
        .allow('', null),

    expiry_date:
      Joi.date()
        .iso()
        .required(),

    price:
      Joi.number()
        .positive()
        .required(),

    stock:
      Joi.number()
        .integer()
        .min(0)
        .required(),

    unit:
      Joi.string()
        .valid(
          'gr',
          'kg',
          'gram',
          'liter',
          'ml',
          'ikat',
          'pcs'
        )
        .required(),
  });

export const updateProductSchema =
  Joi.object({

    product_name:
      Joi.string()
        .min(2)
        .max(150)
        .required(),

    category:
      Joi.string()
        .max(50)
        .required(),

    description:
      Joi.string()
        .allow('', null),

    expiry_date:
      Joi.date()
        .iso()
        .required(),

    price:
      Joi.number()
        .positive()
        .required(),

    stock:
      Joi.number()
        .integer()
        .min(0)
        .required(),

    unit:
      Joi.string()
        .valid(
          'gr',
          'kg',
          'gram',
          'liter',
          'ml',
          'ikat',
          'pcs'
        )
        .required(),

    status:
      Joi.string()
        .valid(
          'tersedia',
          'Habis',
          'inactive'
        ),
  });

export const updateProductStatusSchema =
  Joi.object({

    status:
      Joi.string()
        .valid(
          'tersedia',
          'Habis',
          'inactive'
        )
        .required(),
  });