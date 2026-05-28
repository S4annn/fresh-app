import express from 'express'

import { register, verifyOtp, resendOtp, login, googleLogin, forgotPasswordController, resetPasswordController } from '../controllers/userController.js'
import { registerSchema, loginSchema, verifyOtpSchema, resendOtpSchema, forgotPasswordSchema, resetPasswordSchema } from '../validator/userValidator.js'
import { validate } from '../middleware/validate.js'

const router = express.Router()

router.post('/register', validate(registerSchema), register)
router.post('/verify-otp', validate(verifyOtpSchema), verifyOtp)
router.post('/resend-otp', validate(resendOtpSchema), resendOtp)
router.post('/login', validate(loginSchema), login)
router.post('/google', googleLogin)
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPasswordController)
router.post('/reset-password', validate(resetPasswordSchema), resetPasswordController)

export default router