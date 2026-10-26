const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    type: { type: String, enum: ['drive', 'shortlist', 'interview', 'general'], default: 'general' },
    driveId: { type: mongoose.Schema.Types.ObjectId, ref: 'Drive' },
    readAt: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
