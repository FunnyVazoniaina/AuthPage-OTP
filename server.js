const express = require('express');
const connectDB = require('./config/db'); 
const autRoutes = require('./routes/authRoutes'); 
const cors = require('cors');
require('dotenv').config();

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

// Routes
app.use('/api/auth', autRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
