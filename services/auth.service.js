const User = require('../models/User');
const generateOtp = require('../utils/generateOtp');
const sendSms = require('../utils/sendSms');
const sendEmail = require('../utils/sendEmail');
const sendVoiceCall = require('../utils/sendVoiceCall');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

class AuthService {
  // Register a new user
  async register(username, password, email) {   
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      password: hashedPassword,
      email,
      isVerified: false,
      mfaEnabled: false
    });
    try {
      await user.save();
      return { message: 'User registered successfully' };
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error('Registration failed');
    }
    }
    // Login user with username and password
    async login(username, password) {
        const user = await User.find
        One({ username });
        if (!user) {
            throw new Error('Invalid credentials');
        }   
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }
        const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return {
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,  
                isVerified: user.isVerified,
                mfaEnabled: user.mfaEnabled
            }
        };
    }
    // Send OTP to user
    async sendOtp(userId, method) {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        const otp = generateOtp();
        user.otp = otp;
        user.otpExpiresAt = Date.now() + 10 * 60 * 1000;
        await user.save();

        if (method === 'email') {   
            if (!user.email) {
                throw new Error('Email is required for email OTP');
            }
            await sendEmail(user.email, 'Your OTP Code', `Your OTP code is: ${otp}`);
        } else if (method === 'sms') {
            if (!user.phone) {
                throw new Error('Phone number is required for SMS OTP');
            }
            await sendSms(user.phone, `Your OTP code is: ${otp}`);
        }
        else if (method === 'voice') {
            if (!user.phone) {
                throw new Error('Phone number is required for voice OTP');
            }
            await sendVoiceCall(user.phone, `Your OTP code is: ${otp}`);
        } else {
            throw new Error('Invalid OTP method');  
        }
        return { message: 'OTP sent successfully' };
    }
    // Verify OTP
    async verifyOtp(userId, otp) {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        if (user.otp !== otp || Date.now() > user.otpExpiresAt) {
            throw new Error('Invalid or expired OTP');
        }
        user.otp = '';
        user.otpExpiresAt = null;
        user.isVerified = true;
        await user.save();
        return { message: 'OTP verified successfully', userId: user._id };
    }
    
}
module.exports = AuthService;