import express from 'express';

import { getAll, getUnreadCount, markAsRead, markAllAsRead, remove } from '../controllers/notificationController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', verifyToken, getAll);
router.get('/unread', verifyToken, getUnreadCount);
router.patch('/read-all', verifyToken, markAllAsRead);
router.patch('/:id/read', verifyToken, markAsRead);
router.delete('/:id', verifyToken, remove);

export default router;