const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Business = require('../models/Business');

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function tokenFor(business) { return jwt.sign({}, process.env.JWT_SECRET, { subject: business._id.toString(), expiresIn: process.env.JWT_EXPIRES_IN || '1d', algorithm: 'HS256' }); }
router.post('/register', async (req, res, next) => {
  try {
    const { businessName, ownerName, email, password } = req.body || {};
    if (![businessName, ownerName, email, password].every(v => typeof v === 'string' && v.trim())) return res.status(400).json({ error: 'All fields are required' });
    if (!emailPattern.test(email.trim()) || password.length < 10 || password.length > 128) return res.status(400).json({ error: 'Use a valid email and a password of 10–128 characters' });
    const normalizedEmail = email.trim().toLowerCase();
    if (await Business.exists({ email: normalizedEmail })) return res.status(409).json({ error: 'An account with this email already exists' });
    const business = await Business.create({ name: businessName.trim(), ownerName: ownerName.trim(), email: normalizedEmail, passwordHash: await bcrypt.hash(password, 12) });
    return res.status(201).json({ token: tokenFor(business), business: { id: business._id, name: business.name, ownerName: business.ownerName, email: business.email } });
  } catch (err) { if (err.code === 11000) return res.status(409).json({ error: 'An account with this email already exists' }); next(err); }
});
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (typeof email !== 'string' || typeof password !== 'string') return res.status(400).json({ error: 'Email and password are required' });
    const business = await Business.findOne({ email: email.trim().toLowerCase() }).select('+passwordHash');
    if (!business || !(await bcrypt.compare(password, business.passwordHash))) return res.status(401).json({ error: 'Invalid email or password' });
    return res.json({ token: tokenFor(business), business: { id: business._id, name: business.name, ownerName: business.ownerName, email: business.email } });
  } catch (err) { next(err); }
});
module.exports = router;
