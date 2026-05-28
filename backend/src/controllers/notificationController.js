import { getUserNotifications, getUserUnreadCount, readNotification, readAllNotifications, removeNotification } from '../services/notificationServices.js';

export const getAll = async (req, res, next) => {
  try {
    const data = await getUserNotifications(
      req.user.id
    );

    res.json({
      status: 'success',
      total: data.length,
      data,
    });

  } catch (err) {
    next(err);
  }
};

export const getUnreadCount = async (req, res, next) => {
  try {
    const data = await getUserUnreadCount(
      req.user.id
    );

    res.json({
      status: 'success',
      data,
    });

  } catch (err) {
    next(err);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const data = await readNotification(
      req.params.id,
      req.user.id
    );

    res.json({
      status: 'success',
      message: 'Notifikasi dibaca',
      data,
    });

  } catch (err) {

    next(err);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    const data = await readAllNotifications(
      req.user.id
    );

    res.json({
      status: 'success',
      updated_count: data.length,
    });

  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    await removeNotification(
      req.params.id,
      req.user.id
    );

    res.json({
      status: 'success',
      message: 'Notifikasi dihapus',
    });

  } catch (err) {
    next(err);
  }
};