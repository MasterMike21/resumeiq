import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import resumeRoutes from './routes/resume.js';

dotenv.config();

const app = express();

// Explicitly list all frontend deployment variations + localhost
const allowedOrigins = [
  'https://resumeiq-lime.vercel.app',
  'https://resumeiq-five.vercel.app',
  'https://resumeiq.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

// Enhanced CORS configuration with proper preflight handling
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or server-to-server)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    } else {
      console.warn(`[CORS] Blocked request from origin: ${origin}`);
      return callback(null, false); // Pass false instead of throwing Error to prevent unhandled 500 crashes on preflight
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Express built-in body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Endpoint (Test this directly in browser)
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    uptime: process.uptime(),
    dbState: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// API Route Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);

// Global Error Handler middleware
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err.stack || err.message || err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error('FATAL: MONGO_URI is missing in Environment Variables!');
}

// Connect Database & Start Server
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB Atlas.');
    app.listen(PORT, () => {
      console.log(`Server executing active connection vectors on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
  });

// Graceful process error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});