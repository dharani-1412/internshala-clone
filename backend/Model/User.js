// backend/Model/User.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: String, // if you use password auth
  name: String,
});

module.exports = mongoose.model('User', userSchema);
