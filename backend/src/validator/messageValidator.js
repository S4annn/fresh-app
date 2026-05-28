import Joi from 'joi';

export const sendMessageSchema = Joi.object({
  receiver_id: Joi.number().integer().positive().required(),
  message_text: Joi.string().trim().min(1).required(),
});
