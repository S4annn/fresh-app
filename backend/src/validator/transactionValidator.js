import Joi from 'joi';

export const createTransactionSchema =
  Joi.object({

    items:
      Joi.array()
        .items(
          Joi.object({
            product_id:
              Joi.number()
                .integer()
                .positive()
                .required(),

            quantity:
              Joi.number()
                .integer()
                .positive()
                .required(),
          })
        )
        .min(1)
        .required(),
  });

export const updateTransactionStatusSchema =
  Joi.object({

    status:
      Joi.string()
        .valid(
          'pending',
          'diproses',
          'selesai',
          'dibatalkan'
        )
        .required(),
  });