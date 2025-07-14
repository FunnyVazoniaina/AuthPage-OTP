const express = require('express');
const connectDB = require('./config/db'); 
const autRoutes = require('./routes/authRoutes'); 
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT ;

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(helmet());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB 
connectDB();
// Routes
app.use('/api/auth', autRoutes);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
