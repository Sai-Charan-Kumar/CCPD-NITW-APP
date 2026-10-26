const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['student', 'tnp', 'head'], default: 'student' },
    rollNumber: { type: String, trim: true },
    department: { type: String, trim: true },
    batch: { type: String, trim: true },
    cgpa: { type: Number, min: 0, max: 10 },
    activeBacklogs: { type: Number, min: 0, default: 0 },
    tenthPercentage: { type: Number, min: 0, max: 100, default: 0 },
    twelfthPercentage: { type: Number, min: 0, max: 100, default: 0 },
    placementStatus: { type: String, enum: ['unplaced', 'placed'], default: 'unplaced' },
    phone: { type: String, trim: true },
    isVerifiedByCCPD: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
