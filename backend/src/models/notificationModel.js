import pool from '../config/db.js';

export const createNotification = async ({ user_id, title, message }) => {
  const result = await pool.query(
    ` INSERT INTO notifications
      (user_id, title, message, is_read, created_at)
      VALUES ($1, $2, $3, false, NOW())
      RETURNING
        id,
        user_id,
        title,
        message,
        is_read,
        TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at
    `, [user_id, title, message]
  );
  return result.rows[0];
};

export const getNotificationsByUser = async (userId) => {
  const result = await pool.query(
    ` SELECT
        id,
        user_id,
        title,
        message,
        is_read,
        TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at
      FROM notifications
      WHERE user_id = $1
      ORDER BY is_read ASC, created_at DESC
    `, [userId]
  );
  return result.rows;
};

export const getUnreadNotificationCount = async (userId) => {
  const result = await pool.query(
    ` SELECT
        COUNT(*)::int AS unread_count
      FROM notifications
      WHERE user_id = $1
        AND is_read = false
    `, [userId]
  );
  return result.rows[0];
};

export const markNotificationAsRead = async (id, userId) => {
  const result = await pool.query(
    ` UPDATE notifications
      SET is_read = true
      WHERE id = $1
        AND user_id = $2
      RETURNING
        id,
        user_id,
        title,
        message,
        is_read,
        TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at
    `, [id, userId]
  );
  return result.rows[0];
};

export const markAllNotificationsAsRead = async (userId) => {
  const result = await pool.query(
    ` UPDATE notifications
      SET is_read = true
      WHERE user_id = $1
        AND is_read = false
      RETURNING id
    `, [userId]
  );
  return result.rows;
};

export const deleteNotification = async (id, userId) => {
  const result = await pool.query(
    ` DELETE FROM notifications
      WHERE id = $1
        AND user_id = $2
      RETURNING id
    `, [id, userId]
  );
  return result.rows[0];
};