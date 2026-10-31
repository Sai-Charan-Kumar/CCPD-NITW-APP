const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['student', 'tnp', 'head'], default: 'student' },
    rollNumber: { type: String, trim: true },
    registrationNumber: { type: String, trim: true },
    department: { type: String, trim: true },
    degree: { type: String, enum: ['B.Tech', 'M.Tech', 'MCA'] },
    batch: { type: String, trim: true },
    cgpa: { type: Number, min: 0, max: 10 },
    activeBacklogs: { type: Number, min: 0, default: 0 },
    tenthPercentage: { type: Number, min: 0, max: 100, default: 0 },
    twelfthPercentage: { type: Number, min: 0, max: 100, default: 0 },
    placementStatus: { type: String, enum: ['unplaced', 'placed'], default: 'unplaced' },
    phone: { type: String, trim: true },
    skills: { type: [String], default: [] },
    resume: {
      fileName: { type: String, default: '' },
      updatedAt: { type: Date },
      verified: { type: Boolean, default: false },
      url: { type: String, default: '' }
    },
    currentOffers: [{
      companyName: String,
      role: String,
      ctc: String
    }],
    designation: { type: String, trim: true },
    avatarUrl: { type: String, trim: true },
    isVerifiedByCCPD: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
