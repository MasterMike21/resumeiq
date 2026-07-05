import express from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import Resume from '../models/Resume.js';
import AnalysisReport from '../models/AnalysisReport.js';
import { protect } from '../middleware/auth.js';
import { analyzeResumeText } from '../services/geminiService.js';

const router = express.Router();
const storage = multer.memoryStorage();

// ✅ Configured to accept both multi-mode file asset keys concurrently
const upload = multer({ storage: storage }).fields([
  { name: 'resume', maxCount: 1 },
  { name: 'jobDescriptionFile', maxCount: 1 }
]);

// ✅ Endpoint path updated to match the frontend call: /resume/analyze
router.post('/analyze', protect, upload, async (req, res) => {
  // Defensive validation ensuring the primary resume file asset arrived safely
  if (!req.files || !req.files.resume) {
    return res.status(400).json({ message: 'Missing primary resume file asset.' });
  }
  
  try {
    // 1. Parse and extract string text layer from the primary resume file buffer
    const resumeFile = req.files.resume[0];
    const resumePdfData = await pdfParse(resumeFile.buffer);
    const resumeText = resumePdfData.text;

    if (!resumeText.trim()) {
      return res.status(400).json({ message: 'Unable to scan textual content layers from the resume file framework.' });
    }

    // 2. Dynamically extract the Job Description based on frontend submission method
    const { jdMethod, jobDescriptionText } = req.body;
    let targetJobDescription = "";

    if (jdMethod === 'text') {
      targetJobDescription = jobDescriptionText || "";
    } else if (jdMethod === 'file' && req.files.jobDescriptionFile) {
      const jdFile = req.files.jobDescriptionFile[0];
      const jdPdfData = await pdfParse(jdFile.buffer);
      targetJobDescription = jdPdfData.text;
    }

    // Validate that a job description actually exists to compare against
    if (!targetJobDescription || !targetJobDescription.trim()) {
      return res.status(400).json({ message: 'Target job description context could not be resolved or was empty.' });
    }

    // 3. Persist the core extracted text profile tracking asset inside MongoDB
    const resume = await Resume.create({
      user: req.user._id,
      fileName: resumeFile.originalname,
      extractedText: resumeText
    });

    // 4. Run the cross-matching Gemini engine sequence passing BOTH parameters
    const analysis = await analyzeResumeText(resumeText, targetJobDescription);

    // 5. Construct and populate the full metrics report schema document
    const report = await AnalysisReport.create({
      user: req.user._id,
      resume: resume._id,
      atsScore: analysis.atsScore,
      breakdown: analysis.breakdown,
      suggestions: analysis.suggestions,
      skillGap: analysis.skillGap,
      recommendedRoles: analysis.recommendedRoles
    });

    // Return the completed database report with a 201 Created status code
    res.status(201).json(report);
  } catch (error) {
    console.error("Analytical Engine Routing Fault Log:", error);
    res.status(500).json({ message: 'Deep analytical processing sequence failed on the server.' });
  }
});

// ✅ Route to pull historical single metric assessments down into the frontend
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