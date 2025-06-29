require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db'); 
const cors = require('cors');

const app = express();
const PORT = process.env.PORT ;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB 
connectDB();

// Import controllers directly
const { register, login, sendOtp, verifyOtp } = require('./controllers/authController');

// Define routes directly
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);
app.post('/api/auth/send-otp', sendOtp);
app.post('/api/auth/verify-otp', verifyOtp);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
