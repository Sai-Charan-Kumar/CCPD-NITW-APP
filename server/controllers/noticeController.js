const Notice = require('../models/Notice');

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
    const notices = await Notice.find().sort({ createdAt: -1 });
    return res.json(notices.map(toFrontend));
  } catch (error) { return next(error); }
};

exports.create = async (req, res, next) => {
  try {
    const { title, content, category, targetAudience } = req.body;
    if (!title || !content || !category) return res.status(400).json({ message: 'Title, content, and category are required.' });
    const notice = await Notice.create({ title, content, category, targetAudience, authorRole: req.user.role });
    return res.status(201).json(toFrontend(notice));
  } catch (error) { return next(error); }
};
