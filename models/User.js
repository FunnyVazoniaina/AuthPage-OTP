const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: String,
  phone: String,
  otp: String,
  otpExpiresAt: Date,
  isVerified: Boolean
});

module.exports = mongoose.model('User', userSchema);
