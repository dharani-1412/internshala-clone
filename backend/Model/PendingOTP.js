const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  userId: String,
  email: String,
  otp: String,
  expiresAt: Date,
});

module.exports = mongoose.model('PendingOTP', otpSchema);
