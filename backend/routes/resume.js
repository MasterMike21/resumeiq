import express from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import Resume from '../models/Resume.js';
import AnalysisReport from '../models/AnalysisReport.js';
import { protect } from '../middleware/auth.js';
import { analyzeResumeText } from '../services/geminiService.js';

const router = express.Router();
const storage = multer.memoryStorage();

// File filter to enforce PDF uploads
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are supported.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter
}).fields([
  { name: 'resume', maxCount: 1 },
  { name: 'jobDescriptionFile', maxCount: 1 }
]);

// Helper function to safely parse PDF text
async function extractPdfText(buffer) {
  try {
    const data = await pdfParse(buffer);
    return data.text || '';
  } catch (err) {
    console.error('[PDF Parsing Exception]:', err.message);
    throw new Error('Invalid or corrupted PDF structure.');
  }
}

// POST /api/resume/analyze
router.post('/analyze', protect, (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, async (req, res) => {
  if (!req.files || !req.files.resume || !req.files.resume[0]) {
    return res.status(400).json({ message: 'Missing primary resume file asset.' });
  }
  
  try {
    // 1. Safe extraction of Resume PDF Text
    const resumeFile = req.files.resume[0];
    let resumeText = '';
    
    try {
      resumeText = await extractPdfText(resumeFile.buffer);
    } catch (parseErr) {
      return res.status(400).json({ 
        message: 'Unable to parse resume PDF. Please ensure the file is a valid, unencrypted PDF.' 
      });
    }

    if (!resumeText.trim()) {
      return res.status(400).json({ 
        message: 'No readable text found in the PDF. If this is an image/scanned resume, please convert it to searchable PDF text.' 
      });
    }

    // 2. Extract Job Description
    const { jdMethod, jobDescriptionText } = req.body;
    let targetJobDescription = "";

    if (jdMethod === 'text') {
      targetJobDescription = jobDescriptionText || "";
    } else if (jdMethod === 'file' && req.files.jobDescriptionFile && req.files.jobDescriptionFile[0]) {
      const jdFile = req.files.jobDescriptionFile[0];
      try {
        targetJobDescription = await extractPdfText(jdFile.buffer);
      } catch (jdParseErr) {
        return res.status(400).json({ 
          message: 'Unable to parse Job Description PDF. Please upload a valid PDF or paste plain text.' 
        });
      }
    }

    if (!targetJobDescription || !targetJobDescription.trim()) {
      return res.status(400).json({ message: 'Target job description context could not be resolved or was empty.' });
    }

    // 3. Persist extracted resume record
    const resume = await Resume.create({
      user: req.user._id,
      fileName: resumeFile.originalname,
      extractedText: resumeText
    });

    // 4. Run analysis with Gemini
    const analysis = await analyzeResumeText(resumeText, targetJobDescription);

    // 5. Construct analysis report
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
    console.error("Analytical Engine Routing Fault Log:", error);
    res.status(500).json({ 
      message: error.message || 'Deep analytical processing sequence failed on the server.' 
    });
  }
});

// GET /api/resume/report/:id
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