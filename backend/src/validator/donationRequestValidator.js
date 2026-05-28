import Joi from 'joi';

export const createDonationRequestSchema =
  Joi.object({

    quantity: Joi.number()
      .positive()
      .required(),

    pickup_time: Joi.date()
      .iso(),

    notes: Joi.string()
      .allow('', null),
  });

export const updateDonationRequestStatusSchema =
  Joi.object({

    status: Joi.string()
      .valid(
        'approved',
        'rejected'
      )
      .required(),
  });