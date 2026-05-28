import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { createMessage } from '../models/messageModel.js';

const onlineUsers = new Map();

function resolveCorsOrigin() {
  const raw = process.env.CORS_ORIGIN || 'http://localhost:5173';
  if (raw === '*') return true; // socket.io accepts boolean for "any origin"
  return raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: resolveCorsOrigin(),
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    // auth
    socket.on('addUser', (token) => {
      try {
        if (!process.env.JWT_SECRET) {
          return socket.emit('socketError', {
            message: 'JWT_SECRET belum dikonfigurasi di server',
          });
        }
        const user = jwt.verify(token, process.env.JWT_SECRET);
        onlineUsers.set(user.id, socket.id);
        socket.userId = user.id;
        io.emit('onlineUsers', Array.from(onlineUsers.keys()));
      } catch {
        socket.emit('socketError', {
          message: 'Invalid token socket',
        });
      }
    });

    // send message
    socket.on('sendMessage', async (data) => {
      try {
        if (!socket.userId) {
          return socket.emit('socketError', {
            message: 'User belum terautentikasi',
          });
        }

        if (!data?.receiver_id || !data?.message_text) {
          return socket.emit('socketError', {
            message: 'Data pesan tidak lengkap',
          });
        }

        const savedMessage = await createMessage({
          sender_id: socket.userId,
          receiver_id: data.receiver_id,
          message_text: data.message_text,
        });

        const receiverSocket = onlineUsers.get(Number(data.receiver_id));
        if (receiverSocket) {
          io.to(receiverSocket).emit('receiveMessage', savedMessage);
        }
        socket.emit('receiveMessage', savedMessage);
      } catch (err) {
        socket.emit('socketError', {
          message: err.message,
        });
      }
    });

    // disconnect
    socket.on('disconnect', () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
      }
      io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    });
  });
};
