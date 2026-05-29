import Joi from 'joi'

export const registerSchema = Joi.object({
  name: Joi.string().required(),

  email: Joi.string()
    .email()
    .required(),

  password: Joi.string()
    .min(6)
    .required(),

  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Konfirmasi password tidak sama',
    }),

  role: Joi.string()
    .valid('pribadi', 'bisnis')
    .required(),

  address: Joi.string()
    .allow('', null),

  latitude: Joi.number()
    .allow(null),

  longitude: Joi.number()
    .allow(null),

  image_url: Joi.string()
    .allow('', null),
})

export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required(),

  password: Joi.string()
    .required(),
})

export const verifyOtpSchema = Joi.object({
  email: Joi.string()
    .email()
    .required(),

  otpCode: Joi.string()
    .length(6)
    .required(),
})

export const resendOtpSchema = Joi.object({
  email: Joi.string()
    .email()
    .required(),
})

export const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .email()
    .required(),
})

export const resetPasswordSchema = Joi.object({
  email: Joi.string()
    .email()
    .required(),

  otpCode: Joi.string()
    .length(6)
    .required(),

  newPassword: Joi.string()
    .min(6)
    .required(),
})

export const updateProfileSchema = Joi.object({
  name: Joi.string()
    .min(3),

  address: Joi.string()
    .allow('', null),

  location_name: Joi.string()
    .allow('', null),

  latitude: Joi.number()
    .allow(null),

  longitude: Joi.number()
    .allow(null),
}).min(1)