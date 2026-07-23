import { GoogleGenAI } from '@google/genai';

const getGenAI = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// 1. Generate 5 targeted interview questions
export const generateInterviewQuestions = async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;
    if (!resumeText || !jobDescription) {
      return res.status(400).json({ error: "Missing resumeText or jobDescription." });
    }

    const ai = getGenAI();
    const prompt = `
      Act as a Lead Technical Interviewer. Analyze the provided candidate resume and target job description.
      Generate exactly 5 targeted interview questions (mix of deep-dive technical on declared projects and behavioral/skill-gap checks).

      Return output in STRICT JSON matching this exact schema:
      {
        "questions": [
          {
            "id": 1,
            "type": "Technical",
            "question": "question text",
            "focusArea": "Project / Technology name",
            "evalCriteria": "Key points candidate must cover"
          }
        ]
      }

      Target JD:
      ${jobDescription}

      Resume Text:
      ${resumeText}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const data = JSON.parse(response.text.trim());
    return res.status(200).json(data);
  } catch (error) {
    console.error("[Interview Controller Error]:", error);
    return res.status(500).json({ error: "Failed to generate interview questions." });
  }
};

// 2. Evaluate candidate answer in real-time
export const evaluateAnswer = async (req, res) => {
  try {
    const { question, evalCriteria, candidateAnswer } = req.body;
    if (!question || !candidateAnswer) {
      return res.status(400).json({ error: "Missing question or candidateAnswer." });
    }

    const ai = getGenAI();
    const prompt = `
      Act as a Senior Engineer interviewing a candidate. Evaluate the candidate's answer against the given question and ideal criteria.

      Question: "${question}"
      Expected Criteria: "${evalCriteria}"
      Candidate Answer: "${candidateAnswer}"

      Return output in STRICT JSON matching this schema:
      {
        "score": 85,
        "feedback": "Concise critical feedback",
        "missingKeyPoints": ["Point 1", "Point 2"],
        "improvedAnswerSnippet": "Example of a stronger answer"
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const data = JSON.parse(response.text.trim());
    return res.status(200).json(data);
  } catch (error) {
    console.error("[Answer Eval Error]:", error);
    return res.status(500).json({ error: "Failed to evaluate candidate answer." });
  }
};