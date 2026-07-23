const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 1. Target Role Benchmark Gap Endpoint
router.post('/benchmark-gap', async (req, res) => {
  try {
    const { targetRole, targetSkills, resumeSkills } = req.body;
    
    const targetArr = (targetSkills || []).map(s => String(s).toLowerCase().trim());
    const resumeArr = (resumeSkills || []).map(s => String(s).toLowerCase().trim());

    const matched = targetArr.filter(skill => 
      resumeArr.some(rs => rs.includes(skill) || skill.includes(rs))
    );
    const missing = targetArr.filter(skill => !matched.includes(skill));
    const score = targetArr.length > 0 ? Math.round((matched.length / targetArr.length) * 100) : 0;

    return res.json({
      targetRole: targetRole || 'Software Engineering',
      matchScore: score,
      matchedSkills: matched,
      missingSkills: missing
    });
  } catch (error) {
    console.error("Benchmark gap error:", error);
    res.status(500).json({ message: "Failed to compute benchmark gaps." });
  }
});

// 2. XYZ Bullet Rewriter Endpoint (Google XYZ Formula)
router.post('/tailor-xyz', async (req, res) => {
  try {
    const { bullets, jobDescription } = req.body;

    if (!bullets || !Array.isArray(bullets) || bullets.length === 0) {
      return res.status(400).json({ message: "Provide an array of bullet points to optimize." });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
You are an elite career coach. Transform the following resume bullet points using Google's XYZ formula:
"Accomplished [X], as measured by [Y], by doing [Z]"

Target Job Description Context:
${jobDescription || 'Software Engineering Track'}

Original Bullets:
${bullets.map((b, i) => `${i + 1}. ${b}`).join('\n')}

Return STRICT VALID JSON in this exact structure:
{
  "tailoredBullets": [
    {
      "original": "original bullet text",
      "xyzVersion": "Accomplished X, measured by Y, by doing Z",
      "impactIncrease": "Estimated +25% metric gain"
    }
  ]
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(text);

    return res.json(parsed);
  } catch (error) {
    console.error("XYZ Tailor Error:", error);
    res.status(500).json({ message: "Failed to generate XYZ bullet optimizations." });
  }
});

// 3. Fetch Public Shareable Profile Endpoint
router.get('/public-profile/:username', async (req, res) => {
  try {
    const { username } = req.params;
    // Replace User Model query with your actual MongoDB Schema model
    const User = require('../models/User'); 
    const user = await User.findOne({ username }).select('-password');

    if (!user) {
      return res.status(404).json({ message: "Public profile not found." });
    }

    return res.json({
      name: user.name,
      username: user.username,
      targetRole: user.targetRole || 'Software Developer',
      skills: user.skills ? user.skills.split(',') : [],
      verifiedAtsScore: user.topAtsScore || 85,
      projects: user.projects || []
    });
  } catch (error) {
    console.error("Public Profile Error:", error);
    res.status(500).json({ message: "Failed to load public profile." });
  }
});

export default router;