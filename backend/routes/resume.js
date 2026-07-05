import express from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import Resume from '../models/Resume.js';
import AnalysisReport from '../models/AnalysisReport.js';
import { protect } from '../middleware/auth.js';
import { analyzeResumeText } from '../services/geminiService.js';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/upload', protect, upload.single('resume'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Missing file asset payload.' });
  
  try {
    const pdfData = await pdfParse(req.file.buffer);
    const extractedText = pdfData.text;

    if (!extractedText.trim()) {
      return res.status(400).json({ message: 'Unable to scan textual content layers from file framework.' });
    }

    const resume = await Resume.create({
      user: req.user._id,
      fileName: req.file.originalname,
      extractedText
    });

    const analysis = await analyzeResumeText(extractedText);

    const report = await AnalysisReport.create({
      user: req.user._id,
      resume: resume._id,
      atsScore: analysis.atsScore,
      breakdown: analysis.breakdown,
      suggestions: analysis.suggestions,
      skillGap: analysis.skillGap,
      recommendedRoles: analysis.recommendedRoles
    });

    res.status(201).json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal parsing configuration runtime fault.' });
  }
});

router.get('/report/:id', protect, async (req, res) => {
  try {
    const report = await AnalysisReport.findById(req.params.id).populate('resume');
    if (!report) return res.status(404).json({ message: 'Report data reference empty.' });
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;