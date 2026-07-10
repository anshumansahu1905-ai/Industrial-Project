const express = require('express');
const requireAuth = require('../middleware/auth');
const { getProfile, updateProfile, toggleFollow, searchUsers } = require('../controllers/userController');

const router = express.Router();

router.get('/search', requireAuth, searchUsers);
router.get('/:username', requireAuth, getProfile);
router.put('/me', requireAuth, updateProfile);
router.post('/:username/follow', requireAuth, toggleFollow);

module.exports = router;
