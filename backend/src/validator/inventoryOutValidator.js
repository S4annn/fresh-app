import Joi from 'joi';

export const createInventoryOutSchema = Joi.object({
  quantity: Joi.number().positive().required().messages({
    'any.required': 'Quantity wajib diisi',
    'number.base': 'Quantity harus berupa angka',
    'number.positive': 'Quantity harus lebih dari 0',
  }),

  notes: Joi.string().allow('', null),
});
