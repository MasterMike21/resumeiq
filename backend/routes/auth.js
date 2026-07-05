const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const validator = require('validator');
const User = require('../models/User');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (!name || !/^[a-zA-Z\s]{2,40}$/.test(name.trim())) return res.status(400).json({ message: 'Invalid character name format.' });
    if (!email || !validator.isEmail(email)) return res.status(400).json({ message: 'Invalid structured email address.' });
    if (!password || password.length < 8 || password.length > 20 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      return res.status(400).json({ message: 'Password does not meet validation complexity.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) return res.status(400).json({ message: 'Email address already in database.' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ name: name.trim(), email: email.toLowerCase().trim(), password: hashedPassword });
    const savedUser = await newUser.save();

    const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: savedUser._id, name: savedUser.name, email: savedUser.email } });
  } catch (err) { res.status(500).json({ message: 'Server creation fault.' }); }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(400).json({ message: 'Invalid email or password parameter configuration.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password parameter configuration.' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch { res.status(500).json({ message: 'Server authentication fault.' }); }
});

router.post('/google', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: 'Missing access payload.' });
  try {
    const ticket = await googleClient.verifyIdToken({ idToken: token, audience: process.env.GOOGLE_CLIENT_ID });
    const { name, email } = ticket.getPayload();
    const cleanEmail = email.toLowerCase().trim();

    let user = await User.findOne({ email: cleanEmail });
    if (!user) {
      const generatedPassword = Math.random().toString(36).slice(-10) + '!A1';
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(generatedPassword, salt);
      user = new User({ name, email: cleanEmail, password: hashedPassword });
      await user.save();
    }

    const appToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ token: appToken, user: { id: user._id, name: user.name, email: user.email } });
  } catch { res.status(400).json({ message: 'Google signature validation fault.' }); }
});

module.exports = router;