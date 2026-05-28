import express from 'express';
import { getPersonalDashboard, getBusinessDashboard } from '../controllers/dashboardController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/personal', verifyToken, allowRoles('pribadi'), getPersonalDashboard);
router.get('/business', verifyToken, allowRoles('bisnis'), getBusinessDashboard);

export default router;