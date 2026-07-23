import { GoogleGenAI } from '@google/genai';

export const analyzeCareerPivot = async (req, res) => {
  try {
    const { resumeText } = req.body;
    if (!resumeText) {
      return res.status(400).json({ error: "Resume text required." });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `
      Analyze this candidate's resume and calculate semantic skill transferability across 3 adjacent engineering tracks:
      1. Full-Stack Web Development
      2. Backend / Distributed Systems Engineer
      3. DevOps / SDE-Cloud

      Return STRICT JSON matching this schema:
      {
        "tracks": [
          {
            "role": "Backend / Distributed Systems",
            "compatibilityScore": 78,
            "matchingSkills": ["Node.js", "Express", "MongoDB"],
            "missingHighPrioritySkills": ["Redis", "Docker", "gRPC", "Message Queues (Kafka)"]
          }
        ]
      }

      Candidate Resume:
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
    console.error("[Pivot Matrix Error]:", error);
    return res.status(500).json({ error: "Failed to compute career pivot matrix." });
  }
};