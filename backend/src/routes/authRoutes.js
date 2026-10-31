const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticate, JWT_SECRET } = require('../middleware/auth');
const AuditLog = require('../models/AuditLog');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, department, phone, badgeNumber } = req.body;
    
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      role: role || 'citizen',
      department,
      phone,
      badgeNumber
    });

    await user.save();
    const token = generateToken(user);

    await AuditLog.create({
      action: 'USER_REGISTERED',
      performedBy: user.email,
      userRole: user.role,
      entityType: 'User',
      entityId: user._id.toString(),
      details: { role: user.role }
    });

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        badgeNumber: user.badgeNumber
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or credentials' });
    }

    const token = generateToken(user);

    await AuditLog.create({
      action: 'USER_LOGIN',
      performedBy: user.email,
      userRole: user.role,
      entityType: 'User',
      entityId: user._id.toString()
    });

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        badgeNumber: user.badgeNumber
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Demo Quick Login Switcher
router.post('/demo-login', async (req, res) => {
  try {
    const { role } = req.body;
    const allowedRoles = ['administrator', 'engineer', 'field_worker', 'citizen'];
    const targetRole = allowedRoles.includes(role) ? role : 'engineer';

    let user = targetRole === 'field_worker' ? (await User.findOne({ email: 'worker@repairtrust.gov' })) || (await User.findOne({ role: targetRole })) : await User.findOne({ role: targetRole });
    if (!user) {
      // create default
      user = new User({
        name: `Demo ${targetRole.replace('_', ' ').toUpperCase()}`,
        email: `demo.${targetRole}@repairtrust.gov`,
        password: 'password123',
        role: targetRole,
        department: 'Municipal Infrastructure Division'
      });
      await user.save();
    }

    const token = generateToken(user);
    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        badgeNumber: user.badgeNumber
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Current User
router.get('/me', authenticate, async (req, res) => {
  return res.json({
    success: true,
    user: req.user
  });
});

module.exports = router;
