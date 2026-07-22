import express from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import Resume from '../models/Resume.js';
import AnalysisReport from '../models/AnalysisReport.js';
import { protect } from '../middleware/auth.js';
import { analyzeResumeText } from '../services/geminiService.js';

const router = express.Router();
const storage = multer.memoryStorage();

// Multer storage & size limit setup
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
}).fields([
  { name: 'resume', maxCount: 1 },
  { name: 'jobDescriptionFile', maxCount: 1 }
]);

/**
 * Robust helper function to extract raw text from PDF or DOCX buffers
 */
async function extractTextFromFile(file) {
  if (!file || !file.buffer) {
    throw new Error('File buffer is empty or missing.');
  }

  const mimeType = file.mimetype || '';
  const fileName = (file.originalname || '').toLowerCase();

  // Handle PDF Files
  if (mimeType === 'application/pdf' || fileName.endsWith('.pdf')) {
    try {
      const pdfData = await pdfParse(file.buffer);
      return pdfData.text || '';
    } catch (err) {
      console.error('[PDF Parsing Error]:', err.message);
      throw new Error(`Failed to parse PDF file (${file.originalname}). Please verify the file is not corrupted or password protected.`);
    }
  } 
  
  // Handle Word Documents (.docx)
  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
    mimeType === 'application/msword' ||
    fileName.endsWith('.docx') ||
    fileName.endsWith('.doc')
  ) {
    try {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      return result.value || '';
    } catch (err) {
      console.error('[DOCX Parsing Error]:', err.message);
      throw new Error(`Failed to parse Word document (${file.originalname}).`);
    }
  }

  // Handle Plain Text Files (.txt)
  if (mimeType.startsWith('text/') || fileName.endsWith('.txt')) {
    return file.buffer.toString('utf-8');
  }

  throw new Error(`Unsupported file format for ${file.originalname}. Please upload a PDF, DOCX, or TXT file.`);
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
    // 1. Safe extraction of Resume Text (PDF or DOCX)
    const resumeFile = req.files.resume[0];
    let resumeText = '';

    try {
      resumeText = await extractTextFromFile(resumeFile);
    } catch (parseErr) {
      return res.status(400).json({ message: parseErr.message });
    }

    if (!resumeText.trim()) {
      return res.status(400).json({ 
        message: 'No readable text layer found in the uploaded resume file.' 
      });
    }

    // 2. Dynamically extract Job Description
    const { jdMethod, jobDescriptionText } = req.body;
    let targetJobDescription = "";

    if (jdMethod === 'text') {
      targetJobDescription = jobDescriptionText || "";
    } else if (jdMethod === 'file' && req.files.jobDescriptionFile && req.files.jobDescriptionFile[0]) {
      const jdFile = req.files.jobDescriptionFile[0];
      try {
        targetJobDescription = await extractTextFromFile(jdFile);
      } catch (jdParseErr) {
        return res.status(400).json({ message: jdParseErr.message });
      }
    }

    if (!targetJobDescription || !targetJobDescription.trim()) {
      return res.status(400).json({ 
        message: 'Target job description context could not be resolved or was empty.' 
      });
    }

    // 3. Persist extracted resume record in MongoDB Atlas
    const resume = await Resume.create({
      user: req.user._id,
      fileName: resumeFile.originalname,
      extractedText: resumeText
    });

    // 4. Run AI analysis sequence via Gemini API
    const analysis = await analyzeResumeText(resumeText, targetJobDescription);

    // 5. Construct analysis report document
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