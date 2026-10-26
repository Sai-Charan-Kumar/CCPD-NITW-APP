const Notification = require('../models/Notification');

const toFrontend = (notification) => ({
  id: notification._id.toString(),
  title: notification.title,
  body: notification.body,
  type: notification.type,
  time: notification.createdAt,
  isRead: Boolean(notification.readAt),
  driveId: notification.driveId ? notification.driveId.toString() : undefined
});

exports.listMine = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ studentId: req.user._id }).sort({ createdAt: -1 }).limit(100);
    return res.json(notifications.map(toFrontend));
  } catch (error) { return next(error); }
};

exports.markRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, studentId: req.user._id },
      { readAt: new Date() },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: 'Notification not found.' });
    return res.json(toFrontend(notification));
  } catch (error) { return next(error); }
};

exports.markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ studentId: req.user._id, readAt: { $exists: false } }, { readAt: new Date() });
    return res.json({ success: true });
  } catch (error) { return next(error); }
};
