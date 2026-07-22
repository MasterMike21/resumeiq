import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import validator from 'validator';
import User from '../models/User.js';

const router = express.Router();

// Fallback initialization for Google OAuth client
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClient = googleClientId ? new OAuth2Client(googleClientId) : null;

// Secret Key check
const getJwtSecret = () => process.env.JWT_SECRET || 'fallback_jwt_secret_key_resumeiq';

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // 1. Name validation
    if (!name || !/^[a-zA-Z\s]{2,40}$/.test(name.trim())) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid name format. Use letters and spaces (2-40 chars).' 
      });
    }

    // 2. Email validation
    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email address format.' 
      });
    }

    // 3. Password complexity validation
    const trimmedPassword = password ? password.trim() : '';
    if (
      !trimmedPassword ||
      trimmedPassword.length < 8 ||
      trimmedPassword.length > 20 ||
      !/[A-Z]/.test(trimmedPassword) ||
      !/[a-z]/.test(trimmedPassword) ||
      !/[0-9]/.test(trimmedPassword) ||
      !/[^A-Za-z0-9]/.test(trimmedPassword)
    ) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be 8-20 characters with uppercase, lowercase, number, and special character.' 
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 4. Existing user check
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'An account with this email address already exists.' 
      });
    }

    // 5. Hash password & Save
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(trimmedPassword, salt);

    const newUser = new User({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword
    });
    
    const savedUser = await newUser.save();

    // 6. Generate JWT Token
    const token = jwt.sign(
      { id: savedUser._id }, 
      getJwtSecret(), 
      { expiresIn: '7d' }
    );

    return res.status(201).json({ 
      success: true,
      token, 
      user: { id: savedUser._id, name: savedUser.name, email: savedUser.email } 
    });

  } catch (err) {
    console.error("Signup Error:", err);

    // Handle Mongo duplicate key error specifically
    if (err.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'An account with this email address already exists.' 
      });
    }

    return res.status(500).json({ 
      success: false, 
      message: err.message || 'Server creation fault.' 
    });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide both email and password.' 
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });
    
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email or password.' 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email or password.' 
      });
    }

    const token = jwt.sign(
      { id: user._id }, 
      getJwtSecret(), 
      { expiresIn: '7d' }
    );

    return res.status(200).json({ 
      success: true,
      token, 
      user: { id: user._id, name: user.name, email: user.email } 
    });

  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ 
      success: false, 
      message: 'Server authentication fault.' 
    });
  }
});

// POST /api/auth/google
router.post('/google', async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing access token payload.' 
    });
  }
  
  try {
    if (!googleClient) {
      return res.status(500).json({ 
        success: false, 
        message: 'Google Client ID is not configured on server.' 
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const { name, email } = ticket.getPayload();
    const cleanEmail = email.toLowerCase().trim();

    let user = await User.findOne({ email: cleanEmail });
    if (!user) {
      const generatedPassword = Math.random().toString(36).slice(-10) + '!A1';
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(generatedPassword, salt);
      
      user = new User({ 
        name: name || 'Google User', 
        email: cleanEmail, 
        password: hashedPassword 
      });
      await user.save();
    }

    const appToken = jwt.sign(
      { id: user._id }, 
      getJwtSecret(), 
      { expiresIn: '7d' }
    );

    return res.status(200).json({ 
      success: true,
      token: appToken, 
      user: { id: user._id, name: user.name, email: user.email } 
    });

  } catch (err) {
    console.error("Google Auth Error:", err);
    return res.status(400).json({ 
      success: false, 
      message: 'Google signature validation fault.' 
    });
  }
});

export default router;