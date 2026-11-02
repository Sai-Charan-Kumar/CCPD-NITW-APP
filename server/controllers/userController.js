const User = require('../models/User');
const { publicUser } = require('./authController');
const User = require('../models/User');

const toStudentProfile = (user) => ({
  id: user._id.toString(),
  name: user.name,
  rollNumber: user.rollNumber || '',
  registrationNumber: user.registrationNumber || user.rollNumber || '',
  email: user.email,
  phone: user.phone || '',
  department: user.department,
  degree: user.degree || '',
  batch: user.batch || `20${user.email.slice(2, 4)}`,
  cgpa: user.cgpa || 0,
  activeBacklogs: user.activeBacklogs || 0,
  placementStatus: user.placementStatus,
  currentOffers: user.currentOffers || [],
  resume: {
    fileName: user.resume?.fileName || '',
    updatedAt: user.resume?.updatedAt ? user.resume.updatedAt.toISOString() : '',
    verified: Boolean(user.resume?.verified),
    url: user.resume?.url || ''
  },
  skills: user.skills || [],
  tenthPercentage: user.tenthPercentage || 0,
  twelfthPercentage: user.twelfthPercentage || 0,
  isVerifiedByCCPD: Boolean(user.isVerifiedByCCPD)
});

exports.getMe = async (req, res, next) => {
  try {
    return res.json({ user: publicUser(req.user) });
  } catch (error) {
    return next(error);
  }
};

exports.getStudentProfile = async (req, res, next) => {
  try {
    return res.json(toStudentProfile(req.user));
  } catch (error) {
    return next(error);
  }
};

exports.updateStudentProfile = async (req, res, next) => {
  try {
    const updates = {};
    if (req.body.name !== undefined) {
      if (typeof req.body.name !== 'string' || !req.body.name.trim()) {
        return res.status(400).json({ message: 'Name cannot be empty.' });
      }
      updates.name = req.body.name.trim();
    }
    if (req.body.phone !== undefined) {
      if (typeof req.body.phone !== 'string') {
        return res.status(400).json({ message: 'Phone must be a string.' });
      }
      updates.phone = req.body.phone.trim();
    }
    if (req.body.resume !== undefined) {
      const resume = req.body.resume;
      if (!resume || typeof resume !== 'object'
        || typeof resume.fileName !== 'string'
        || typeof resume.url !== 'string') {
        return res.status(400).json({ message: 'Resume must include a file name and URL.' });
      }
      updates.resume = {
        fileName: resume.fileName.trim(),
        url: resume.url.trim(),
        updatedAt: new Date(),
        verified: false
      };

    }
    if (!Object.keys(updates).length) {
      return res.status(400).json({ message: 'No profile fields were provided.' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ message: 'User account no longer exists.' });
    return res.json(toStudentProfile(user));
  } catch (error) {
    return next(error);
  }
};

exports.listRegisteredStudents = async (req, res, next) => {
  try {
    const students = await User.find({ role: { $in: ['student', 'tnp'] } })
      .select('name email rollNumber registrationNumber department batch cgpa phone placementStatus isVerifiedByCCPD createdAt')
      .sort({ name: 1 });
    return res.json(students.map((student) => ({
      id: student._id.toString(),
      name: student.name,
      email: student.email,
      rollNumber: student.rollNumber || '',
      registrationNumber: student.registrationNumber || student.rollNumber || '',
      department: student.department || '',
      batch: student.batch || '',
      cgpa: student.cgpa ?? 0,
      phone: student.phone || '',
      placementStatus: student.placementStatus,
      isVerifiedByCCPD: Boolean(student.isVerifiedByCCPD),
      registeredAt: student.createdAt.toISOString(),
      tnpAccess: student.role === 'tnp'
    })));
  } catch (error) {
    return next(error);
  }
};

exports.updateTnpAccess = async (req, res, next) => {
  try {
    if (typeof req.body.enabled !== 'boolean') {
      return res.status(400).json({ message: 'enabled must be a boolean.' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User account not found.' });
    if (user.role === 'head') {
      return res.status(400).json({ message: 'CCPD head access cannot be changed here.' });
    }
    user.role = req.body.enabled ? 'tnp' : 'student';
    await user.save();
    return res.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role.toUpperCase()
      }
    });
  } catch (error) {
    return next(error);
  }
};

const coordinatorView = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role.toUpperCase(),
  rollNumber: user.rollNumber || '',
  department: user.department || '',
  batch: user.batch || ''
});

exports.searchStudentsForCoordinator = async (req, res, next) => {
  try {
    const query = typeof req.query.query === 'string' ? req.query.query.trim() : '';
    if (query.length < 2) {
      return res.status(400).json({ message: 'Enter at least two characters to search.' });
    }
    const pattern = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const students = await User.find({
      role: 'student',
      $or: [{ name: pattern }, { email: pattern }, { rollNumber: pattern }]
    })
      .select('name email role rollNumber department batch')
      .sort({ name: 1 })
      .limit(20);
    return res.json(students.map(coordinatorView));
  } catch (error) {
    return next(error);
  }
};

exports.listCoordinators = async (req, res, next) => {
  try {
    const coordinators = await User.find({ role: 'tnp' })
      .select('name email role rollNumber department batch')
      .sort({ name: 1 });
    return res.json(coordinators.map(coordinatorView));
  } catch (error) {
    return next(error);
  }
};

exports.promoteStudentToCoordinator = async (req, res, next) => {
  try {
    const student = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'student' },
      { role: 'tnp' },
      { new: true, runValidators: true }
    ).select('name email role rollNumber department batch');
    if (!student) return res.status(404).json({ message: 'Student not found or already a coordinator.' });
    return res.json({ user: coordinatorView(student) });
  } catch (error) {
    return next(error);
  }
};

exports.demoteCoordinator = async (req, res, next) => {
  try {
    const coordinator = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'tnp' },
      { role: 'student' },
      { new: true, runValidators: true }
    ).select('name email role rollNumber department batch');
    if (!coordinator) return res.status(404).json({ message: 'Coordinator not found.' });
    return res.json({ user: coordinatorView(coordinator) });
  } catch (error) {
    return next(error);
  }
};
