const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const publicUser = (user) => ({
  id: user._id.toString(),
  email: user.email,
  name: user.name,
  role: user.role.toUpperCase() === 'HEAD' ? 'CCPD_HEAD' : user.role.toUpperCase(),
  rollNumber: user.rollNumber,
  department: user.department,
  cgpa: user.cgpa,
  phone: user.phone
});

const issueToken = (user) =>
  jwt.sign({ userId: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, rollNumber, department, cgpa } = req.body;
    if (!name || !email || !password || !rollNumber || !department || cgpa === undefined) {
      return res.status(400).json({ message: 'Name, email, password, roll number, department, and CGPA are required.' });
    }
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.status(409).json({ message: 'An account already exists with this email.' });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name, email: email.toLowerCase().trim(), passwordHash, rollNumber, department, cgpa, role: 'student'
    });
    return res.status(201).json({ token: issueToken(user), user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: String(email || '').toLowerCase().trim() }).select('+passwordHash');
    if (!user || !(await bcrypt.compare(password || '', user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    return res.json({ token: issueToken(user), user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
};

exports.publicUser = publicUser;
