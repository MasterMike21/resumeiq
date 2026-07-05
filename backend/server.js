import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import resumeRoutes from './routes/resume.js';
import dashboardRoutes from './routes/dashboard.js';

dotenv.config();
connectDB();

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/', (req, res) => res.send('ResumeIQ Backend Operational Engine'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Active API context pipeline live on port ${PORT}`));