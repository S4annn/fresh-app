import Joi from 'joi';

export const createDonationSchema =
  Joi.object({

    food_name: Joi.string()
      .required(),

    quantity: Joi.number()
      .positive()
      .required(),

    unit: Joi.string()
      .required(),

    pickup_location: Joi.string()
      .required(),

    expiry_date: Joi.date()
      .required(),

    notes: Joi.string()
      .allow('', null),
  });

export const updateDonationStatusSchema =
  Joi.object({

    status: Joi.string()
      .valid(
        'available',
        'completed'
      )
      .required(),
  });