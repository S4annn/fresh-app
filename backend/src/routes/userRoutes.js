import express from 'express';

import { getUserProfile, updateUserProfile, deleteUserController } from '../controllers/userController.js';
import { updateProfileSchema } from '../validator/userValidator.js';
import { validate } from '../middleware/validate.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile', verifyToken, getUserProfile);
router.put('/profile', verifyToken, validate(updateProfileSchema), updateUserProfile);
router.delete('/profile', verifyToken, deleteUserController);

export default router;