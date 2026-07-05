import express from 'express';
import AnalysisReport from '../models/AnalysisReport.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/summary', protect, async (req, res) => {
  try {
    const reports = await AnalysisReport.find({ user: req.user._id })
      .populate('resume', 'fileName')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;