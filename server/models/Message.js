const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    groupId: { type: String, required: true, trim: true, index: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true, trim: true, maxlength: 500 }
  },
  { timestamps: true }
);

messageSchema.index({ groupId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
