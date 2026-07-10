const express = require('express');
const requireAuth = require('../middleware/auth');
const { getConversations, getMessages } = require('../controllers/messageController');

const router = express.Router();

router.get('/', requireAuth, getConversations);
router.get('/:username', requireAuth, getMessages);

module.exports = router;
