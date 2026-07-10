const Notification = require('../models/Notification');

async function getNotifications(req, res) {
  const notifications = await Notification.find({ recipient: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('actor', 'username displayName avatarUrl');

  res.json({ notifications });
}

async function markAllRead(req, res) {
  await Notification.updateMany(
    { recipient: req.user._id, readAt: null },
    { $set: { readAt: new Date() } }
  );
  res.json({ message: 'Marked all as read.' });
}

module.exports = { getNotifications, markAllRead };
