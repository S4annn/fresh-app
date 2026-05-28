import express from 'express';

import { getAllRecommendations } from '../controllers/recommendationController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', verifyToken, allowRoles('pribadi'), getAllRecommendations);

export default router;