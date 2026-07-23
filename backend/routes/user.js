import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

const getJwtSecret = () => process.env.JWT_SECRET || 'fallback_jwt_secret_key_resumeiq';

// JWT Auth Middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized access' });
  }
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};

// GET /api/user/profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({ success: true, user });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error fetching profile' });
  }
});

// PUT /api/user/profile
router.put('/profile', authMiddleware, async (req, res) => {
  const { name, targetRole, experienceLevel, skills, githubUrl, linkedinUrl } = req.body;

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name.trim();
    if (targetRole !== undefined) user.targetRole = targetRole;
    if (experienceLevel !== undefined) user.experienceLevel = experienceLevel;
    if (skills !== undefined) user.skills = skills;
    if (githubUrl !== undefined) user.githubUrl = githubUrl;
    if (linkedinUrl !== undefined) user.linkedinUrl = linkedinUrl;

    const updatedUser = await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        targetRole: updatedUser.targetRole,
        experienceLevel: updatedUser.experienceLevel,
        skills: updatedUser.skills,
        githubUrl: updatedUser.githubUrl,
        linkedinUrl: updatedUser.linkedinUrl
      }
    });
  } catch (err) {
    console.error("Profile update error:", err);
    return res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

export default router;