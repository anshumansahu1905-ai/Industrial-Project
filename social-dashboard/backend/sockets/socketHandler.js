const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const User = require('../models/User');
const { subscriber } = require('../config/redis');
const { CHANNEL } = require('../utils/notify');

// Tracks which socket belongs to which user so a Redis-published notification
// (which may originate from a different server process) can be routed to the
// right open connection.
const onlineUsers = new Map(); // userId -> Set of socket ids

function registerSocketHandlers(io) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required.'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.sub);
      if (!user) return next(new Error('User no longer exists.'));
      socket.userId = user._id.toString();
      next();
    } catch (err) {
      next(new Error('Invalid session.'));
    }
  });

  io.on('connection', (socket) => {
    const { userId } = socket;
    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
    onlineUsers.get(userId).add(socket.id);
    socket.join(`user:${userId}`);

    socket.on('message:send', async ({ recipientId, body }) => {
      if (!body || !body.trim()) return;
      const conversationId = Message.buildConversationId(userId, recipientId);
      const message = await Message.create({
        conversationId,
        sender: userId,
        recipient: recipientId,
        body: body.trim(),
      });

      const payload = {
        id: message._id,
        conversationId,
        sender: userId,
        recipient: recipientId,
        body: message.body,
        createdAt: message.createdAt,
      };

      io.to(`user:${recipientId}`).emit('message:new', payload);
      io.to(`user:${userId}`).emit('message:new', payload);
    });

    socket.on('typing', ({ recipientId, isTyping }) => {
      io.to(`user:${recipientId}`).emit('typing', { from: userId, isTyping });
    });

    socket.on('disconnect', () => {
      const set = onlineUsers.get(userId);
      if (set) {
        set.delete(socket.id);
        if (set.size === 0) onlineUsers.delete(userId);
      }
    });
  });

  // Bridge: Redis pub/sub -> this server's connected sockets. This is what
  // lets notifications work even if the API instance that created them isn't
  // the same one holding the recipient's websocket connection.
  subscriber.subscribe(CHANNEL, (err) => {
    if (err) console.error('Failed to subscribe to notification channel:', err.message);
  });

  subscriber.on('message', (channel, message) => {
    if (channel !== CHANNEL) return;
    try {
      const notification = JSON.parse(message);
      io.to(`user:${notification.recipient}`).emit('notification:new', notification);
    } catch (err) {
      console.error('Malformed notification payload:', err.message);
    }
  });
}

module.exports = registerSocketHandlers;
