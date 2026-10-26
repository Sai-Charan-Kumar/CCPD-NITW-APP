const GroupMessage = require('../models/GroupMessage');

const toFrontend = (message) => ({
  id: message._id.toString(),
  groupId: message.groupId,
  senderId: message.senderId._id ? message.senderId._id.toString() : message.senderId.toString(),
  senderName: message.senderId.name || 'CCPD Coordinator',
  message: message.message,
  sentAt: message.createdAt
});

exports.list = async (req, res, next) => {
  try {
    const messages = await GroupMessage.find({ groupId: req.params.groupId })
      .populate('senderId', 'name role')
      .sort({ createdAt: 1 })
      .limit(200);
    return res.json(messages.map(toFrontend));
  } catch (error) {
    return next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const message = typeof req.body.message === 'string' ? req.body.message.trim() : '';
    if (!message) return res.status(400).json({ message: 'Message cannot be empty.' });
    const created = await GroupMessage.create({
      groupId: req.params.groupId,
      senderId: req.user._id,
      message
    });
    await created.populate('senderId', 'name role');
    return res.status(201).json(toFrontend(created));
  } catch (error) {
    return next(error);
  }
};

module.exports = { list: exports.list, create: exports.create };
