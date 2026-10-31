const Group = require('../models/Group');

const toFrontend = (group) => ({
  id: group._id.toString(),
  companyName: group.companyName,
  role: group.role,
  currentPhase: group.currentPhase,
  memberCount: group.memberCount ?? group.members.length
});

exports.listMine = async (req, res, next) => {
  try {
    const filter = ['tnp', 'head'].includes(req.user.role)
      ? {}
      : { members: req.user._id };
    const groups = await Group.find(filter).sort({ createdAt: -1 });
    return res.json(groups.map(toFrontend));
  } catch (error) {
    return next(error);
  }
};
