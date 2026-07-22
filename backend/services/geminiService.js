import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

export const analyzeResumeText = async (resumeText, jobDescription) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("FATAL: GEMINI_API_KEY is missing from environment variables!");
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }

  const ai = new GoogleGenAI({ apiKey });

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
      "suggestions": ["Incorporate operational scale benchmarks into your software development descriptions"],
      "skillGap": ["Docker", "Kubernetes", "Next.js"],
      "recommendedRoles": ["Full Stack Engineer", "Software Developer Trainee"]
    }
    
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

    const text = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error("Empty text response received from Gemini.");
    }

    return JSON.parse(text.trim());
  } catch (error) {
    console.error("Gemini Failure Detail Log:", error.message || error);
    throw new Error(`Gemini processing error: ${error.message || error}`);
  }
};