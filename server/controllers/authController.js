const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const PendingRegistration = require('../models/PendingRegistration');
const { sendVerificationOtp } = require('../config/mailer');

const studentEmailPattern = /^[a-z]{2}\d{2}[a-z]{2}b[a-z0-9]{4}@student\.nitw\.ac\.in$/i;
const otpLifetimeMs = 10 * 60 * 1000;
const maxOtpAttempts = 5;

const createOtp = () => String(crypto.randomInt(100000, 1000000));
const hashOtp = (otp) => crypto.createHash('sha256').update(otp).digest('hex');

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
    if (!name || typeof email !== 'string' || !password || !rollNumber || !department || cgpa === undefined) {
      return res.status(400).json({ message: 'Name, email, password, roll number, department, and CGPA are required.' });
    }
    const normalizedEmail = email.toLowerCase().trim();
    if (!studentEmailPattern.test(normalizedEmail)) {
      return res.status(400).json({
        message: 'Registration requires a valid NITW student email, for example sm24csb0a77@student.nitw.ac.in.'
      });
    }
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) return res.status(409).json({ message: 'An account already exists with this email.' });
    const passwordHash = await bcrypt.hash(password, 12);
    const otp = createOtp();
    await PendingRegistration.findOneAndUpdate(
      { email: normalizedEmail },
      {
        name, email: normalizedEmail, passwordHash, rollNumber, department, cgpa,
        otpHash: hashOtp(otp), otpExpiresAt: new Date(Date.now() + otpLifetimeMs), otpAttempts: 0
      },
      { upsert: true, new: true, runValidators: true }
    );
    try {
      await sendVerificationOtp(normalizedEmail, otp);
    } catch (error) {
      await PendingRegistration.deleteOne({ email: normalizedEmail });
      return next(error);
    }
    return res.status(202).json({
      message: 'A verification OTP has been sent to your NITW email.',
      requiresVerification: true,
      email: normalizedEmail
    });
  } catch (error) {
    return next(error);
  }
};

exports.verifyRegistration = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = typeof email === 'string' ? email.toLowerCase().trim() : '';
    if (!normalizedEmail || !/^\d{6}$/.test(String(otp || ''))) {
      return res.status(400).json({ message: 'A valid email and six-digit OTP are required.' });
    }
    const pending = await PendingRegistration.findOne({ email: normalizedEmail });
    if (!pending) return res.status(404).json({ message: 'No pending registration found. Please register again.' });
    if (pending.otpExpiresAt.getTime() <= Date.now()) {
      await pending.deleteOne();
      return res.status(400).json({ message: 'This OTP has expired. Please register again.' });
    }
    if (pending.otpAttempts >= maxOtpAttempts) {
      await pending.deleteOne();
      return res.status(429).json({ message: 'Too many invalid OTP attempts. Please register again.' });
    }
    if (hashOtp(String(otp)) !== pending.otpHash) {
      await PendingRegistration.updateOne({ _id: pending._id }, { $inc: { otpAttempts: 1 } });
      return res.status(400).json({ message: 'Invalid OTP.' });
    }
    const user = await User.create({
      name: pending.name, email: pending.email, passwordHash: pending.passwordHash,
      rollNumber: pending.rollNumber, department: pending.department, cgpa: pending.cgpa,
      batch: `20${pending.email.slice(2, 4)}`, role: 'student'
    });
    await pending.deleteOne();
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
