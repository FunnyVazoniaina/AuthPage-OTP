const User = require('../models/User');
const generateOtp = require('../utils/generateOtp');
const sendSms = require('../utils/sendSms');
const sendEmail = require('../utils/sendEmail');
const sendVoiceCall = require('../utils/sendVoiceCall');

exports.sendOtp = async (req, res) => {
  const { email, phone, method } = req.body;
  const otp = generateOtp();
  const expires = new Date(Date.now() + 5 * 60000); // 5 mins

  const user = await User.findOneAndUpdate(
    { $or: [{ email }, { phone }] },
    { email, phone, otp, otpExpiresAt: expires, isVerified: false },
    { upsert: true, new: true }
  );

  try {
    if (method === 'sms') await sendSms(phone, otp);
    else if (method === 'email') await sendEmail(email, otp);
    else if (method === 'voice') await sendVoiceCall(phone, otp);

    res.json({ message: 'OTP sent successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, phone, otp } = req.body;
  const user = await User.findOne({
    $or: [{ email }, { phone }],
    otp,
    otpExpiresAt: { $gt: new Date() }
  });

  if (!user) {
    return res.status(400).json({ error: 'Invalid or expired OTP' });
  }

  user.isVerified = true;
  user.otp = null;
  user.otpExpiresAt = null;
  await user.save();

  res.json({ message: 'OTP verified successfully' });
};
