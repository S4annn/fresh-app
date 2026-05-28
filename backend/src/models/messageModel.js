import pool from '../config/db.js';

export const createMessage = async ({ sender_id, receiver_id, message_text }) => {
  const result = await pool.query(
    `INSERT INTO messages
      (sender_id, receiver_id, message_text, is_read, created_at)
     VALUES ($1, $2, $3, false, NOW())
     RETURNING
      id,
      sender_id,
      receiver_id,
      message_text,
      is_read,
      TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at`,
    [sender_id, receiver_id, message_text]
  );

  return result.rows[0];
};

export const getChatMessages = async (user1, user2) => {
  const result = await pool.query(
    `SELECT
      id,
      sender_id,
      receiver_id,
      message_text,
      is_read,
      TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at
     FROM messages
     WHERE (sender_id = $1 AND receiver_id = $2)
        OR (sender_id = $2 AND receiver_id = $1)
     ORDER BY created_at ASC`,
    [user1, user2]
  );

  return result.rows;
};

export const getInbox = async (userId) => {
  const result = await pool.query(
    `SELECT DISTINCT ON (chat_partner)
      id,
      sender_id,
      receiver_id,
      CASE
        WHEN sender_id = $1 THEN receiver_id
        ELSE sender_id
      END AS chat_partner,
      message_text,
      is_read,
      TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at
     FROM (
      SELECT
        *,
        CASE
          WHEN sender_id = $1 THEN receiver_id
          ELSE sender_id
        END AS chat_partner
      FROM messages
      WHERE sender_id = $1 OR receiver_id = $1
     ) inbox
     ORDER BY chat_partner, created_at DESC`,
    [userId]
  );

  return result.rows;
};
