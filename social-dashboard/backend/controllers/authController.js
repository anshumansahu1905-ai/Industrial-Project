const User = require('../models/User');
const generateToken = require('../utils/generateToken');

async function register(req, res) {
  const { username, email, password, displayName } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email, and password are required.' });
  }

  const existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username }] });
  if (existing) {
    return res.status(409).json({ message: 'That email or username is already taken.' });
  }

  const user = await User.create({ username, email, password, displayName: displayName || username });
  const token = generateToken(user._id);
  res.status(201).json({ token, user: user.toPublicJSON() });
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Incorrect email or password.' });
  }

  const token = generateToken(user._id);
  res.json({ token, user: user.toPublicJSON() });
}

async function me(req, res) {
  res.json({ user: req.user.toPublicJSON() });
}

module.exports = { register, login, me };
