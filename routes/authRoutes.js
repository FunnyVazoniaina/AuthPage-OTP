const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const { 
    register, 
    login, 
    sendOtp, 
    verifyOtp } 
    = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/send-otp',authMiddleware, sendOtp);
router.post('/verify-otp', authMiddleware, verifyOtp);

module.exports = router;
