const mongoose = require('mongoose');

const driveSchema = new mongoose.Schema(
  {
    company: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    ctc: {
      total: { type: String, required: true, trim: true },
      baseSalary: { type: String, trim: true },
      joiningBonus: String,
      performanceBonus: String,
      stocksOrEsops: String,
      stipendDuringInternship: String
    },
    eligibilityCriteria: {
      minCgpa: { type: Number, default: 0 },
      allowedDepartments: { type: [String], default: [] },
      maxBacklogs: { type: Number, default: 0 },
      minTenthMarks: { type: Number, default: 0 },
      minTwelfthMarks: { type: Number, default: 0 },
      openForAlreadyPlaced: { type: Boolean, default: false }
    },
    description: { type: String, required: true },
    registrationDeadline: { type: Date, required: true },
    driveDate: Date,
    status: { type: String, enum: ['Active', 'Closed'], default: 'Active' },
    currentPhase: { type: String, enum: ['OA', 'Interview', 'Final Selects'], default: 'OA' },
    requiredExtraDocs: { type: [String], default: [] },
    location: { type: String, default: 'To be announced' },
    workMode: { type: String, enum: ['On-site', 'Hybrid', 'Remote'], default: 'On-site' },
    jobType: { type: String, default: 'Full Time (FTE)' },
    responsibilities: { type: [String], default: [] },
    skillsRequired: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    selectionRounds: { type: [mongoose.Schema.Types.Mixed], default: [] },
    companyLogo: String,
    accentColor: { type: String, default: '#2563EB' },
    attachmentName: String
  },
  { timestamps: true }
);

module.exports = mongoose.model('Drive', driveSchema);
