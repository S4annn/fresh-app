import { getNotificationsByUser, getUnreadNotificationCount, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } from '../models/notificationModel.js';

export const getUserNotifications = async (userId) => {
  return await getNotificationsByUser(
    userId
  );
};

export const getUserUnreadCount = async (userId) => {
  return await getUnreadNotificationCount(
    userId
  );
};

export const readNotification = async (id, userId) => {
  const notification = await markNotificationAsRead(
      id,
      userId
    );

  if (!notification) {
    const error = new Error('Notifikasi tidak ditemukan');
    error.statusCode = 404;
    throw error;
  }
  return notification;
};

export const readAllNotifications = async (userId) => {
  return await markAllNotificationsAsRead(
    userId
  );
};

export const removeNotification = async (id, userId) => {
  const notification = await deleteNotification(
    id,
    userId
  );

  if (!notification) {
    const error = new Error('Notifikasi tidak ditemukan');
    error.statusCode = 404;
    throw error;
  }

  return notification;
};