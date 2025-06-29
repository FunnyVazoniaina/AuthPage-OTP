const AuthService = require('../services/auth.service');

exports.register = async (req, res) => {
    const { username, password, email } = req.body; 
    try {
        const result = await AuthService.register(username, password, email);
        res.status(201).json(result);
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Registration failed', error: error.message });
    }
};
exports.login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await AuthService.login(username, password);
        res.status(200).json(result);
    } catch (error) {
        console.error('Login error:', error);
        res.status(401).json({ message: 'Login failed', error: error.message });
    }
};

exports.sendOtp = async (req, res) => {
    const userId = req.user.id; // Get user ID from authenticated request
    const { method } = req.body;
    try {
        const result = await AuthService.sendOtp(userId, method);
        res.status(200).json(result);
    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({ message: 'Failed to send OTP', error: error.message });
    }
};

exports.verifyOtp = async (req, res) => {
    const userId = req.user.id; // Get user ID from authenticated request
    const { otp } = req.body;   
    try {
        const result = await AuthService.verifyOtp(userId, otp);
        res.status(200).json(result);
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(400).json({ message: 'OTP verification failed', error: error.message });
    }
};