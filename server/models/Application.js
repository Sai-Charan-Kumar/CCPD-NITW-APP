const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    driveId: { type: mongoose.Schema.Types.ObjectId, ref: 'Drive', required: true },
    status: {
      type: String,
      enum: ['Applied', 'Shortlisted', 'OA Scheduled', 'Interview', 'Offered', 'Rejected'],
      default: 'Applied'
    },
    shortlistPublishedAt: Date,
    shortlistNotes: { type: String, trim: true },
    nextEventDate: Date,
    nextEventTime: String,
    nextEventLocationOrLink: String,
    nextEventInstructions: String,
    appliedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

applicationSchema.index({ studentId: 1, driveId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
