import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

// Helper function to pause execution (backoff delay)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

  // Candidate models to attempt in order of preference
  const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
  const maxRetriesPerModel = 2;

  for (const modelName of modelsToTry) {
    for (let attempt = 1; attempt <= maxRetriesPerModel; attempt++) {
      try {
        console.log(`[Gemini Engine] Attempting request with model: ${modelName} (Attempt ${attempt}/${maxRetriesPerModel})`);

        const response = await ai.models.generateContent({
          model: modelName,
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
        const is503 = error?.status === 503 || (error?.message && error.message.includes("503"));
        console.warn(`[Gemini Engine Warning] Model ${modelName} attempt ${attempt} failed:`, error.message || error);

        if (is503 && attempt < maxRetriesPerModel) {
          // Exponential backoff with random jitter (e.g., wait ~2s, then ~4s)
          const backoffTime = Math.pow(2, attempt) * 1000 + Math.floor(Math.random() * 500);
          console.log(`[Gemini Engine] 503 High Demand detected. Retrying in ${backoffTime}ms...`);
          await delay(backoffTime);
        } else if (!is503) {
          // If it's a non-503 hard error (like bad format/auth), break out immediately
          break;
        }
      }
    }
    console.warn(`[Gemini Engine] Model ${modelName} exhausted. Attempting fallback model...`);
  }

  throw new Error("Gemini AI models are currently experiencing high demand. Please try submitting again in a few moments.");
};