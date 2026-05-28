import express from 'express';
import { sendMessage, getChat, getInboxController } from '../controllers/messageController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { sendMessageSchema } from '../validator/messageValidator.js';

const router = express.Router();

router.post('/', verifyToken, validate(sendMessageSchema), sendMessage);
router.get('/conversations', verifyToken, getInboxController);
router.get('/conversations/:receiverId', verifyToken, getChat);

export default router;
