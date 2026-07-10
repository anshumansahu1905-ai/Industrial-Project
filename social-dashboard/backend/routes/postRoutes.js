const express = require('express');
const requireAuth = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  createPost,
  getFeed,
  toggleLike,
  addComment,
  getComments,
  deletePost,
} = require('../controllers/postController');

const router = express.Router();

router.get('/', requireAuth, getFeed);
router.post('/', requireAuth, upload.single('media'), createPost);
router.delete('/:id', requireAuth, deletePost);
router.post('/:id/like', requireAuth, toggleLike);
router.get('/:id/comments', requireAuth, getComments);
router.post('/:id/comments', requireAuth, addComment);

module.exports = router;
