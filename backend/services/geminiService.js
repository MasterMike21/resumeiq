import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ✅ Updated to accept two distinct textual inputs for cross-analysis matching
export const analyzeResumeText = async (resumeText, jobDescription) => {
  const prompt = `
    You are an expert enterprise-grade ATS (Applicant Tracking System) alignment analyzer. 
    Your task is to comprehensively audit the provided Resume Text against the Target Job Description criteria, cross-matching core keywords, required technologies, and experience parameters.

    Return your complete evaluation matrix in a strict JSON object matching this exact schema:
    {
      "atsScore": 85,
      "breakdown": {
        "contactInfo": 10,
        "skills": 20,
        "education": 15,
        "experience": 20,
        "projects": 10,
        "keywords": 10
      },
      "suggestions": ["Incorporate operational scale benchmarks into your software development descriptions", "Mention your Information Technology course alignment or UIET credentials explicitly if applicable"],
      "skillGap": ["Docker", "Kubernetes", "Next.js"],
      "recommendedRoles": ["Full Stack Engineer", "Software Developer Trainee"]
    }
    
    Scoring Guideline Allocation Protocol (Sum matches atsScore, Max 100 total):
    - contactInfo: max 10 (Check for email, active contact channels, links)
    - skills: max 25 (Evaluate technical skill list depth against industry baselines)
    - education: max 15 (Assess academic qualifications, specialization clarity)
    - experience: max 25 (Rate project velocity, professional history clarity, bullet item metrics)
    - projects: max 15 (Audit technical complexity, tool stack diversity, training deployment history)
    - keywords: max 10 (Strict text density matching against the provided Job Description keywords)

    Target Job Description:
    ${jobDescription}

    Candidate Resume Text:
    ${resumeText}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    // Strip trailing newlines or markdown frames out cleanly before object compilation
    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Gemini Extraction Framework Failure Log:", error);
    throw new Error("Failed to process target parsing alignment metrics.");
  }
};