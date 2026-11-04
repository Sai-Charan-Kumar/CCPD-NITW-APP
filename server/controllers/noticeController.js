const Notice = require('../models/Notice');
const Drive = require('../models/Drive');
const PlacementGroup = require('../models/PlacementGroup');
const User = require('../models/User');
const { sendNoticeEmail } = require('../config/mailer');

const toFrontend = (notice) => ({
  id: notice._id.toString(),
  title: notice.title,
  category: notice.category,
  priority: 'normal',
  publishedAt: notice.createdAt,
  author: notice.authorRole.toUpperCase(),
  authorRole: notice.authorRole,
  summary: notice.content.slice(0, 160),
  body: notice.content,
  targetBranches: notice.targetAudience,
  isPinned: false,
  isRead: false
});

exports.list = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.id) filter._id = req.query.id;
    if (req.query.category && req.query.category !== 'All') filter.category = req.query.category;
    const notices = await Notice.find(filter).sort({ createdAt: -1 });
    return res.json(notices.map(toFrontend));
  } catch (error) { return next(error); }
};

exports.create = async (req, res, next) => {
  try {
    const {
      title,
      content,
      category = 'Policy & Guidelines',
      recipientType,
      driveId
    } = req.body;
    if (typeof title !== 'string' || !title.trim() || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ message: 'Notice title and message are required.' });
    }
    if (!['all_students', 'company_group'].includes(recipientType)) {
      return res.status(400).json({ message: 'Choose All Students or a Company-Specific Group.' });
    }
    let companyName;
    let recipientIds;
    if (recipientType === 'all_students') {
      const students = await User.find({ role: { $in: ['student', 'tnp'] }, email: { $exists: true, $ne: '' } }).select('_id email');
      recipientIds = students.map((student) => student._id);
    } else {
      if (typeof driveId !== 'string' || !driveId) {
        return res.status(400).json({ message: 'Select an ongoing company placement drive.' });
      }
      const drive = await Drive.findOne({
        _id: driveId,
        status: 'Active',
        registrationDeadline: { $gt: new Date() }
      }).select('company');
      if (!drive) return res.status(400).json({ message: 'The selected placement drive is not ongoing.' });
      const group = await PlacementGroup.findOne({ driveId: drive._id }).select('memberIds');
      recipientIds = group?.memberIds || [];
      companyName = drive.company;
    }
    const recipients = await User.find({
      _id: { $in: recipientIds },
      role: { $in: ['student', 'tnp'] },
      email: { $exists: true, $ne: '' }
    }).distinct('email');
    if (!recipients.length) return res.status(400).json({ message: 'No registered student recipients were found.' });

    const notice = await Notice.create({
      title: title.trim(),
      content: content.trim(),
      category,
      targetAudience: [recipientType === 'all_students' ? 'All Students' : companyName],
      authorRole: req.user.role
    });
    const delivery = await sendNoticeEmail({
      recipients,
      title: title.trim(),
      content: content.trim(),
      senderName: req.user.name,
      companyName
    });
    const status = delivery.failed ? 207 : 201;
    return res.status(status).json({
      notice: toFrontend(notice),
      targeted: recipients.length,
      delivered: delivery.delivered,
      failed: delivery.failed,
      message: delivery.failed
        ? `Notice saved. ${delivery.delivered} emails delivered and ${delivery.failed} failed.`
        : `Notice sent successfully to ${delivery.delivered} recipients.`
    });
  } catch (error) { return next(error); }
};

exports.recipientDrives = async (req, res, next) => {
  try {
    const drives = await Drive.find({
      status: 'Active',
      registrationDeadline: { $gt: new Date() }
    }).select('_id company role registrationDeadline').sort({ registrationDeadline: 1 });
    return res.json(drives.map((drive) => ({
      id: drive._id.toString(),
      companyName: drive.company,
      role: drive.role,
      registrationDeadline: drive.registrationDeadline
    })));
  } catch (error) { return next(error); }
};
