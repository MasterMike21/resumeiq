import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import resumeRoutes from './routes/resume.js'; // Added your resume processing routes

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://resumeiq-five.vercel.app' : 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// API Route Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes); // Mounted resume analyzer endpoint

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

mongoose.connect(MONGO_URI)
  .then(() => app.listen(PORT, () => console.log(`Server executing active connection vectors on port ${PORT}`)))
  .catch(err => console.error('MongoDB Connection Error:', err));