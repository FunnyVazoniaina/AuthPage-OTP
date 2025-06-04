const User = require('../models/User');
const generateOtp = require('../utils/generateOtp');
const sendSms = require('../utils/sendSms');
const sendEmail = require('../utils/sendEmail');
const sendVoiceCall = require('../utils/sendVoiceCall');
const jwt = require('jsonwebtoken');

// Register new user
exports.register = async (req, res) => {
  try {
    const { username, password, email, phone } = req.body;

    // Validation des champs requis
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const user = new User({
      username,
      password,
      email,
      phone,
      isVerified: false,
      mfaEnabled: true
    });

    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
};

// Login with username and password
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log('Login attempt for username:', username);

    // Validation des champs requis
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Vérifier que JWT_SECRET est défini
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      console.log('User not found:', username);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('User found:', user.username);

    // Check password - vérifier que la méthode comparePassword existe
    if (typeof user.comparePassword !== 'function') {
      console.error('comparePassword method not found on user model');
      return res.status(500).json({ error: 'Authentication method not available' });
    }

    const isPasswordValid = await user.comparePassword(password);
    console.log('Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // If MFA is enabled, require OTP verification
    if (user.mfaEnabled) {
      console.log('MFA required for user:', username);
      
      // Generate temporary token for MFA process
      const tempToken = jwt.sign(
        { userId: user._id, step: 'mfa_required' },
        process.env.JWT_SECRET,
        { expiresIn: '10m' }
      );

      return res.json({
        message: 'MFA required',
        tempToken,
        mfaRequired: true,
        availableMethods: ['email', 'sms', 'voice']
      });
    }

    // If no MFA, generate full access token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Login successful for user:', username);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      error: 'Login failed', 
      details: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

// Send OTP for MFA
exports.sendOtp = async (req, res) => {
  try {
    const { tempToken, method, contact } = req.body;

    if (!tempToken || !method) {
      return res.status(400).json({ error: 'tempToken and method are required' });
    }

    // Verify temp token
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    if (decoded.step !== 'mfa_required') {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const otp = generateOtp();
    const expires = new Date(Date.now() + 5 * 60000); // 5 minutes

    // Update user with OTP
    user.otp = otp;
    user.otpExpiresAt = expires;
    
    // Update contact info if provided
    if (method === 'email' && contact) {
      user.email = contact;
    } else if ((method === 'sms' || method === 'voice') && contact) {
      user.phone = contact;
    }
    
    await user.save();

    // Send OTP based on method
    try {
      if (method === 'email') {
        if (!user.email) {
          return res.status(400).json({ error: 'Email is required for email OTP' });
        }
        await sendEmail(user.email, otp);
      } else if (method === 'sms') {
        if (!user.phone) {
          return res.status(400).json({ error: 'Phone number is required for SMS OTP' });
        }
        await sendSms(user.phone, otp);
      } else if (method === 'voice') {
        if (!user.phone) {
          return res.status(400).json({ error: 'Phone number is required for voice OTP' });
        }
        await sendVoiceCall(user.phone, otp);
      } else {
        return res.status(400).json({ error: 'Invalid OTP method' });
      }
    } catch (sendError) {
      console.error('Error sending OTP:', sendError);
      return res.status(500).json({ error: 'Failed to send OTP' });
    }

    res.json({ 
      message: 'OTP sent successfully',
      method,
      contact: method === 'email' ? user.email : user.phone
    });
  } catch (err) {
    console.error('SendOTP error:', err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

// Verify OTP and complete authentication
exports.verifyOtp = async (req, res) => {
  try {
    const { tempToken, otp } = req.body;

    if (!tempToken || !otp) {
      return res.status(400).json({ error: 'tempToken and otp are required' });
    }

    // Verify temp token
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    if (decoded.step !== 'mfa_required') {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = await User.findOne({
      _id: decoded.userId,
      otp,
      otpExpiresAt: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Clear OTP
    user.otp = null;
    user.otpExpiresAt = null;
    user.isVerified = true;
    await user.save();

    // Generate full access token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Authentication successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    console.error('VerifyOTP error:', err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.status(500).json({ error: 'OTP verification failed' });
  }
};
