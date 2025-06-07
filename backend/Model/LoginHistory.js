const mongoose = require('mongoose');

const loginHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  ipAddress: String,
  browser: String,
  os: String,
  deviceType: String,
  time: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('LoginHistory', loginHistorySchema);
