const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const authRoutes = require('./routes/auth');

const app = express();

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://resumeiq-five.vercel.app' : 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI)
  .then(() => app.listen(PORT, () => console.log(`Server executing active connection vectors on port ${PORT}`)))
  .catch(err => console.error(err));