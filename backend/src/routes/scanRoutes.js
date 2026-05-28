import express from 'express';
import { scanFood } from '../controllers/scanController.js';
import { uploadImage } from '../middleware/uploadMiddleware.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', verifyToken, uploadImage.single('image'), scanFood);

export default router;
