const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    currentPhase: {
      type: String,
      enum: ['OA', 'Interview', 'Final Selects'],
      default: 'OA'
    },
    driveId: { type: mongoose.Schema.Types.ObjectId, ref: 'Drive' },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    memberCount: { type: Number, min: 0, default: 0 }
  },
  { timestamps: true }
);

groupSchema.pre('save', function updateMemberCount(next) {
  this.memberCount = this.members.length;
  next();
});

module.exports = mongoose.model('Group', groupSchema);
