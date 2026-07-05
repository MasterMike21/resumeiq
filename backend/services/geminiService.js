import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const analyzeResumeText = async (text) => {
  const prompt = `
    You are an expert ATS (Applicant Tracking System) platform. Analyze the following resume text and provide comprehensive metrics feedback in a strict JSON object.
    
    The response MUST match this exact JSON schema:
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
      "suggestions": ["Add metrics to your impact points", "Include a link to your GitHub profile"],
      "skillGap": ["Docker", "Kubernetes", "TypeScript"],
      "recommendedRoles": ["Full Stack Engineer", "DevOps Engineer"]
    }
    
    Scoring Guideline Rules (Max 100 total):
    - contactInfo: max 10
    - skills: max 25
    - education: max 15
    - experience: max 25
    - projects: max 15
    - keywords: max 10

    Resume Text:
    ${text}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Gemini Extraction Framework Failure:", error);
    throw new Error("Failed to process parsing evaluation metrics.");
  }
};