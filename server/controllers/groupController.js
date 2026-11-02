const PlacementGroup = require('../models/PlacementGroup');

const toFrontend = (group) => ({
  id: group._id.toString(),
  groupId: group._id.toString(),
  companyName: group.companyName,
  role: group.role,
  currentPhase: group.driveId.currentPhase || 'OA',
  memberCount: group.memberIds.length
});

exports.mine = async (req, res, next) => {
  try {
    const groups = await PlacementGroup.find({ memberIds: req.user._id })
      .populate('driveId', 'currentPhase')
      .sort({ createdAt: -1 });
    return res.json(groups.map(toFrontend));
  } catch (error) {
    return next(error);
  }
};

exports.createForDrive = async (drive, coordinatorId) => PlacementGroup.create({
  driveId: drive._id,
  companyName: drive.company,
  role: drive.role,
  coordinatorId,
  memberIds: [coordinatorId]
});

exports.addMember = async (driveId, studentId) => PlacementGroup.findOneAndUpdate(
  { driveId },
  { $addToSet: { memberIds: studentId } },
  { new: true }
);

exports.removeForDrive = async (driveId) => PlacementGroup.deleteOne({ driveId });
