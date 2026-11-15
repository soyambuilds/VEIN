const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const wrap = require('../utils/wrap');
const { BLOOD_GROUPS } = require('../utils/constants');

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
const fail = (msg, status = 400) => Object.assign(new Error(msg), { status });

router.post('/register', wrap(async (req, res) => {
  const { name, email, password, role, bloodGroup, phone, city, gender, dob } = req.body;
  if (!name || !email || !password) throw fail('Name, email and password are required');
  if (!/^\S+@\S+\.\S+$/.test(email)) throw fail('Enter a valid email address');
  if (password.length < 6) throw fail('Password must be at least 6 characters');
  if (!['donor', 'receiver'].includes(role)) throw fail('Choose donor or receiver');
  if (!BLOOD_GROUPS.includes(bloodGroup)) throw fail('Choose your blood group');
  if (role === 'donor' && (!dob || !gender)) throw fail('Date of birth and gender are required for donors');
  const user = await User.create({ name, email, password, role, bloodGroup, phone, city, gender, dob });
  res.status(201).json({ token: sign(user._id), user });
}));

router.post('/login', wrap(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: (email || '').toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password || '')))
    throw fail('Email or password is incorrect', 401);
  if (!user.active) throw fail('This account has been deactivated', 403);
  res.json({ token: sign(user._id), user });
}));

router.get('/me', protect, (req, res) => res.json({ user: req.user }));

module.exports = router;
