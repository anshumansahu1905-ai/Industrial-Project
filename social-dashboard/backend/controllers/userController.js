const User = require('../models/User');
const Post = require('../models/Post');
const { pushNotification } = require('../utils/notify');

async function getProfile(req, res) {
  const user = await User.findOne({ username: req.params.username });
  if (!user) return res.status(404).json({ message: 'User not found.' });

  const posts = await Post.find({ author: user._id }).sort({ createdAt: -1 }).limit(50);
  const isFollowing = req.user ? user.followers.some((f) => f.equals(req.user._id)) : false;

  res.json({ user: user.toPublicJSON(), posts, isFollowing });
}

async function updateProfile(req, res) {
  const { displayName, bio, avatarUrl, coverUrl } = req.body;
  const user = req.user;

  if (displayName !== undefined) user.displayName = displayName;
  if (bio !== undefined) user.bio = bio;
  if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
  if (coverUrl !== undefined) user.coverUrl = coverUrl;

  await user.save();
  res.json({ user: user.toPublicJSON() });
}

async function toggleFollow(req, res) {
  const target = await User.findOne({ username: req.params.username });
  if (!target) return res.status(404).json({ message: 'User not found.' });
  if (target._id.equals(req.user._id)) {
    return res.status(400).json({ message: "You can't follow yourself." });
  }

  const alreadyFollowing = target.followers.some((f) => f.equals(req.user._id));

  if (alreadyFollowing) {
    target.followers = target.followers.filter((f) => !f.equals(req.user._id));
    req.user.following = req.user.following.filter((f) => !f.equals(target._id));
  } else {
    target.followers.push(req.user._id);
    req.user.following.push(target._id);
  }

  await target.save();
  await req.user.save();

  if (!alreadyFollowing) {
    await pushNotification({ recipient: target._id, actor: req.user._id, type: 'follow' });
  }

  res.json({ isFollowing: !alreadyFollowing, followerCount: target.followers.length });
}

async function searchUsers(req, res) {
  const q = (req.query.q || '').trim();
  if (!q) return res.json({ users: [] });

  const users = await User.find({
    $or: [{ username: new RegExp(q, 'i') }, { displayName: new RegExp(q, 'i') }],
  }).limit(10);

  res.json({ users: users.map((u) => u.toPublicJSON()) });
}

module.exports = { getProfile, updateProfile, toggleFollow, searchUsers };
