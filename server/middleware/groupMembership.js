const Group = require('../models/Group');

const requireGroupMembership = async (req, res, next) => {
  try {
    if (['tnp', 'head'].includes(req.user.role)) return next();
    const group = await Group.findOne({ _id: req.params.groupId, members: req.user._id }).select('_id');
    if (!group) return res.status(403).json({ message: 'You are not a member of this placement group.' });
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = requireGroupMembership;
