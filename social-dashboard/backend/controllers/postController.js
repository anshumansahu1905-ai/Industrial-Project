const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const { pushNotification } = require('../utils/notify');

async function createPost(req, res) {
  const { caption } = req.body;
  let mediaUrl = '';
  let mediaType = 'none';

  if (req.file) {
    mediaUrl = `/uploads/${req.file.filename}`;
    mediaType = req.file.mimetype.startsWith('video') ? 'video' : 'image';
  }

  if (!caption && !mediaUrl) {
    return res.status(400).json({ message: 'A post needs a caption or media.' });
  }

  const post = await Post.create({ author: req.user._id, caption, mediaUrl, mediaType });
  const populated = await post.populate('author', 'username displayName avatarUrl');
  res.status(201).json({ post: populated });
}

async function getFeed(req, res) {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = 10;

  // Feed favors people you follow, falling back to everyone once that runs out.
  const followingIds = req.user.following;
  const authorFilter = followingIds.length
    ? { author: { $in: [...followingIds, req.user._id] } }
    : {};

  const posts = await Post.find(authorFilter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('author', 'username displayName avatarUrl');

  const withLikeState = posts.map((p) => ({
    ...p.toObject(),
    likeCount: p.likes.length,
    likedByMe: p.likes.some((id) => id.equals(req.user._id)),
  }));

  res.json({ posts: withLikeState, page, hasMore: posts.length === limit });
}

async function toggleLike(req, res) {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found.' });

  const alreadyLiked = post.likes.some((id) => id.equals(req.user._id));

  if (alreadyLiked) {
    post.likes = post.likes.filter((id) => !id.equals(req.user._id));
  } else {
    post.likes.push(req.user._id);
  }
  await post.save();

  if (!alreadyLiked) {
    await pushNotification({ recipient: post.author, actor: req.user._id, type: 'like', post: post._id });
  }

  res.json({ likeCount: post.likes.length, likedByMe: !alreadyLiked });
}

async function addComment(req, res) {
  const { body } = req.body;
  if (!body || !body.trim()) return res.status(400).json({ message: 'Comment cannot be empty.' });

  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found.' });

  const comment = await Comment.create({ post: post._id, author: req.user._id, body: body.trim() });
  post.commentCount += 1;
  await post.save();

  await pushNotification({ recipient: post.author, actor: req.user._id, type: 'comment', post: post._id });

  const populated = await comment.populate('author', 'username displayName avatarUrl');
  res.status(201).json({ comment: populated });
}

async function getComments(req, res) {
  const comments = await Comment.find({ post: req.params.id })
    .sort({ createdAt: 1 })
    .populate('author', 'username displayName avatarUrl');
  res.json({ comments });
}

async function deletePost(req, res) {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found.' });
  if (!post.author.equals(req.user._id)) {
    return res.status(403).json({ message: 'You can only delete your own posts.' });
  }
  await post.deleteOne();
  await Comment.deleteMany({ post: post._id });
  res.json({ message: 'Post deleted.' });
}

module.exports = { createPost, getFeed, toggleLike, addComment, getComments, deletePost };
