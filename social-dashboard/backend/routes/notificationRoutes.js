const express = require('express');
const requireAuth = require('../middleware/auth');
const { getNotifications, markAllRead } = require('../controllers/notificationController');

const router = express.Router();

router.get('/', requireAuth, getNotifications);
router.post('/read-all', requireAuth, markAllRead);

module.exports = router;
