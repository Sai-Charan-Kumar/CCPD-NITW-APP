const mongoose = require('mongoose');

const roundSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  duration: { type: String, required: true, trim: true },
  questionsAsked: { type: [String], default: [] },
  tipsAndStrategy: { type: String, required: true, trim: true }
}, { _id: false });

const interviewExperienceSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    companyLogo: { type: String, default: '' },
    studentName: { type: String, required: true, trim: true },
    batch: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    verdict: { type: String, enum: ['Selected', 'Offered', 'Reached Final Round'], required: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
    cgpa: { type: Number, min: 0, max: 10, required: true },
    packageOffered: { type: String, required: true, trim: true },
    rounds: { type: [roundSchema], default: [] },
    overallAdvice: { type: String, required: true, trim: true },
    postedDate: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model('InterviewExperience', interviewExperienceSchema);
