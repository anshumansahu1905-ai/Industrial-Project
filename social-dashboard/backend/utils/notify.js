const { publisher } = require('../config/redis');
const Notification = require('../models/Notification');

const CHANNEL = 'pulsegrid:notifications';

// Persists a notification and publishes it on Redis so any server process /
// connected socket can push it to the recipient in real time.
async function pushNotification({ recipient, actor, type, post }) {
  if (recipient.toString() === actor.toString()) return null;

  const notification = await Notification.create({ recipient, actor, type, post });
  const populated = await notification.populate('actor', 'username displayName avatarUrl');

  const payload = {
    id: populated._id,
    type: populated.type,
    post: populated.post,
    createdAt: populated.createdAt,
    actor: {
      id: populated.actor._id,
      username: populated.actor.username,
      displayName: populated.actor.displayName,
      avatarUrl: populated.actor.avatarUrl,
    },
    recipient: recipient.toString(),
  };

  await publisher.publish(CHANNEL, JSON.stringify(payload));
  return payload;
}

module.exports = { pushNotification, CHANNEL };
