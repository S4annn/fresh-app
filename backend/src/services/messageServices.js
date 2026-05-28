import { createMessage, getChatMessages, getInbox } from '../models/messageModel.js';

export const sendMessageService = async (data) => {
  if (!data.sender_id || !data.receiver_id || !data.message_text) {
    const error = new Error('Data pesan tidak lengkap');
    error.statusCode = 400;
    throw error;
  }

  return await createMessage(data);
};

export const chatService = async (user1, user2) => {
  return await getChatMessages(user1, user2);
};

export const inboxService = async (userId) => {
  return await getInbox(userId);
};
