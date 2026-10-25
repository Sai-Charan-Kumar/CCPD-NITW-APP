const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    category: { type: String, required: true },
    authorRole: { type: String, enum: ['tnp', 'head'], required: true },
    targetAudience: { type: [String], default: ['All Students'] }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notice', noticeSchema);
