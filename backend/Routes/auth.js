const express = require('express');
const router = express.Router();
const { detectDevice } = require('../lib/detectClient');
const LoginHistory = require('../Model/LoginHistory');
const PendingOTP = require('../Model/PendingOTP');
const { sendOtpEmail } = require('../lib/sendOtpEmail');
const User = require('../Model/User');

// ✅ POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { browser, os, deviceType } = detectDevice(req);
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const hour = new Date().getHours();

    if (deviceType === 'mobile' && (hour < 10 || hour >= 13)) {
      return res.status(403).json({ message: '❌ Mobile login allowed only between 10 AM and 1 PM' });
    }

    if (browser === 'Chrome') {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

      await PendingOTP.findOneAndUpdate(
        { email },
        { otp, userId: user._id, expiresAt },
        { upsert: true }
      );

      await sendOtpEmail(email, otp);
      return res.status(401).json({ message: '📩 OTP sent to email. Please verify.' });
    }

    await LoginHistory.create({ userId: user._id, ipAddress, browser, os, deviceType });

    res.status(200).json({
      message: '✅ Login successful',
      user: { id: user._id, email: user.email, name: user.name },
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ✅ POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const record = await PendingOTP.findOne({ email });
    if (!record) return res.status(404).json({ message: 'OTP not found' });
    if (record.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
    if (new Date() > record.expiresAt) {
      await PendingOTP.deleteOne({ email });
      return res.status(400).json({ message: 'OTP expired' });
    }

    await PendingOTP.deleteOne({ email });

    const user = await User.findById(record.userId);
    const { browser, os, deviceType } = detectDevice(req);
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    await LoginHistory.create({ userId: user._id, ipAddress, browser, os, deviceType });

    res.status(200).json({
      message: '✅ OTP verified. Login allowed.',
      userId: record.userId,
    });

  } catch (err) {
    console.error('OTP verify error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, name } = req.body;
  if (!email || !name) {
    return res.status(400).json({ message: 'Email and name are required' });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const newUser = new User({ email, name });
    await newUser.save();

    res.status(201).json({ message: 'User created', user: newUser });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ DELETE /api/auth/delete
router.delete('/delete', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    const deletedUser = await User.findOneAndDelete({ email });
    if (!deletedUser) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ message: '✅ User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ GET /api/auth/login-history/:userId (internal use)
router.get('/login-history/:userId', async (req, res) => {
  try {
    const userId = req.params.userId.trim();
    const history = await LoginHistory.find({ userId }).sort({ time: -1 });
    res.status(200).json({ message: '✅ Login history by userId', history });
  } catch (err) {
    console.error('Login history fetch error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ✅ GET /api/auth/login-history?email= (for frontend/Postman)
router.get('/login-history', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ message: 'Email query param is required' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const history = await LoginHistory.find({ userId: user._id }).sort({ time: -1 });
    res.status(200).json({ message: '✅ Login history fetched', history });
  } catch (err) {
    console.error('Login history error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ GET /api/auth/user-id?email=
router.get('/user-id', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ message: 'Email required' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ userId: user._id });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ GET /api/auth/users (for feed display)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, '_id email');
    res.status(200).json(users);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
