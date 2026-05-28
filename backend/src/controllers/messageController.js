import { sendMessageService, chatService, inboxService } from '../services/messageServices.js';

export const sendMessage = async (req, res, next) => {
  try {
    const sender_id = req.user.id;
    const { receiver_id, message_text } = req.body;

    const result = await sendMessageService({
      sender_id,
      receiver_id,
      message_text,
    });

    res.status(201).json({
      status: 'success',
      message: 'Pesan berhasil dikirim',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getChat = async (req, res, next) => {
  try {
    const user1 = req.user.id;
    const user2 = req.params.receiverId;

    const result = await chatService(user1, user2);

    res.json({
      status: 'success',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getInboxController = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await inboxService(userId);

    res.json({
      status: 'success',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
