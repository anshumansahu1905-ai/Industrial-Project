const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verifies the JWT on the Authorization header and attaches req.user
async function protect(req, res, next) {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized, token invalid or expired' });
  }
}

// Must be used after `protect`
function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}

// Like `protect`, but doesn't fail the request if there's no/invalid token.
// Used on public routes that behave slightly differently for logged-in users
// (e.g. tracking product views for recommendations).
async function attachUserIfPresent(req, res, next) {
  const token = req.headers.authorization?.startsWith('Bearer')
    ? req.headers.authorization.split(' ')[1]
    : null;

  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
  } catch (err) {
    // invalid/expired token on an optional route - just proceed as anonymous
  }
  next();
}

module.exports = { protect, requireAdmin, attachUserIfPresent };
