const express = require('express');
const requireAuth = require('../middleware/auth');
const { getOverview } = require('../controllers/analyticsController');

const router = express.Router();

router.get('/overview', requireAuth, getOverview);

module.exports = router;
