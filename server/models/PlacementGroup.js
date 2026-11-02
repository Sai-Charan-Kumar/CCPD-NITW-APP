const mongoose = require('mongoose');

const placementGroupSchema = new mongoose.Schema(
  {
    driveId: { type: mongoose.Schema.Types.ObjectId, ref: 'Drive', required: true, unique: true },
    companyName: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    coordinatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    memberIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  { timestamps: true }
);

module.exports = mongoose.model('PlacementGroup', placementGroupSchema);
