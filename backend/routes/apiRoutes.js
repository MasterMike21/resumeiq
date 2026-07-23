import express from 'express';
import { generateInterviewQuestions, evaluateAnswer } from '../controllers/interviewController.js';
import { analyzeCareerPivot } from '../controllers/pivotController.js';
import { anonymizeResumeText } from '../utils/anonymizer.js';

const router = express.Router();

// Feature 1: AI Mock Interviewer
router.post('/interview/generate-questions', generateInterviewQuestions);
router.post('/interview/evaluate-answer', evaluateAnswer);

// Feature 2: Career Pivot Matrix
router.post('/career/pivot-matrix', analyzeCareerPivot);

// Feature 3: Blind Screening Anonymizer
router.post('/anonymize', (req, res) => {
  try {
    const { resumeText } = req.body;
    if (!resumeText) return res.status(400).json({ error: "No resume text provided." });

    const anonymizedText = anonymizeResumeText(resumeText);
    return res.status(200).json({ anonymizedText });
  } catch (error) {
    return res.status(500).json({ error: "Failed to anonymize text." });
  }
});

export default router;