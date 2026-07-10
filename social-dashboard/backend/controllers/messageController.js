const Message = require('../models/Message');
const User = require('../models/User');

async function getConversations(req, res) {
  const userId = req.user._id;

  const messages = await Message.find({
    $or: [{ sender: userId }, { recipient: userId }],
  }).sort({ createdAt: -1 });

  const byConversation = new Map();
  for (const m of messages) {
    if (!byConversation.has(m.conversationId)) byConversation.set(m.conversationId, m);
  }

  const conversations = await Promise.all(
    [...byConversation.values()].map(async (m) => {
      const otherId = m.sender.equals(userId) ? m.recipient : m.sender;
      const other = await User.findById(otherId);
      const unreadCount = await Message.countDocuments({
        conversationId: m.conversationId,
        recipient: userId,
        readAt: null,
      });
      return {
        conversationId: m.conversationId,
        otherUser: other ? other.toPublicJSON() : null,
        lastMessage: m.body,
        lastMessageAt: m.createdAt,
        unreadCount,
      };
    })
  );

  res.json({ conversations });
}

async function getMessages(req, res) {
  const { username } = req.params;
  const other = await User.findOne({ username });
  if (!other) return res.status(404).json({ message: 'User not found.' });

  const conversationId = Message.buildConversationId(req.user._id, other._id);
  const messages = await Message.find({ conversationId }).sort({ createdAt: 1 }).limit(200);

  await Message.updateMany(
    { conversationId, recipient: req.user._id, readAt: null },
    { $set: { readAt: new Date() } }
  );

  res.json({ conversationId, messages, otherUser: other.toPublicJSON() });
}

module.exports = { getConversations, getMessages };
