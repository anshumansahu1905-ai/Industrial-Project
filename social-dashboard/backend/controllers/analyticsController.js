const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');

// Aggregates a lightweight engagement summary for the logged-in user's own content.
async function getOverview(req, res) {
  const userId = req.user._id;

  const posts = await Post.find({ author: userId });
  const totalLikes = posts.reduce((sum, p) => sum + p.likes.length, 0);
  const totalComments = posts.reduce((sum, p) => sum + p.commentCount, 0);

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const dailyBuckets = {};
  for (let i = 0; i < 30; i += 1) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    dailyBuckets[key] = { date: key, posts: 0, likes: 0, comments: 0 };
  }

  posts
    .filter((p) => p.createdAt >= thirtyDaysAgo)
    .forEach((p) => {
      const key = p.createdAt.toISOString().slice(0, 10);
      if (dailyBuckets[key]) {
        dailyBuckets[key].posts += 1;
        dailyBuckets[key].likes += p.likes.length;
        dailyBuckets[key].comments += p.commentCount;
      }
    });

  const timeline = Object.values(dailyBuckets).sort((a, b) => (a.date > b.date ? 1 : -1));

  const topPosts = [...posts]
    .sort((a, b) => b.likes.length + b.commentCount - (a.likes.length + a.commentCount))
    .slice(0, 5)
    .map((p) => ({
      id: p._id,
      caption: p.caption,
      mediaUrl: p.mediaUrl,
      likeCount: p.likes.length,
      commentCount: p.commentCount,
      createdAt: p.createdAt,
    }));

  const user = await User.findById(userId);

  res.json({
    summary: {
      postCount: posts.length,
      totalLikes,
      totalComments,
      followerCount: user.followers.length,
      followingCount: user.following.length,
      avgEngagement: posts.length ? ((totalLikes + totalComments) / posts.length).toFixed(1) : '0',
    },
    timeline,
    topPosts,
  });
}

module.exports = { getOverview };
