const Drive = require('../models/Drive');
const groupController = require('./groupController');

const toFrontend = (drive) => {
  const d = drive.toObject ? drive.toObject() : drive;
  const now = new Date();
  const deadline = new Date(d.registrationDeadline);
  const daysUntilDeadline = (deadline.getTime() - now.getTime()) / (24 * 60 * 60 * 1000);
  const status = d.status === 'Closed' || deadline <= now
    ? 'closed'
    : daysUntilDeadline <= 3
      ? 'deadline_near'
      : 'ongoing';
  return {
    ...d,
    id: d._id.toString(),
    companyName: d.company,
    salary: { ctcDisplay: d.ctc.total, ...d.ctc },
    eligibility: { ...d.eligibilityCriteria, maxActiveBacklogs: d.eligibilityCriteria.maxBacklogs },
    status,
    appliedCount: d.appliedCount || 0,
    adminPhase: d.currentPhase
  };
};

exports.toFrontend = toFrontend;

exports.list = async (req, res, next) => {
  try {
    const { category, query } = req.query;
    const filter = { status: 'Active', registrationDeadline: { $gt: new Date() } };
    if (category && category !== 'All') filter.category = category;
    if (query) filter.$or = [
      { company: { $regex: query, $options: 'i' } },
      { role: { $regex: query, $options: 'i' } },
      { skillsRequired: { $regex: query, $options: 'i' } }
    ];
    const drives = await Drive.find(filter).sort({ registrationDeadline: 1 });
    return res.json(drives.map(toFrontend));
  } catch (error) { return next(error); }
};

exports.getById = async (req, res, next) => {
  try {
    const drive = await Drive.findById(req.params.id);
    if (!drive) return res.status(404).json({ message: 'Drive not found.' });
    return res.json(toFrontend(drive));
  } catch (error) { return next(error); }
};

exports.create = async (req, res, next) => {
  try {
    const { companyName, role, ctc, registrationDeadline, description, requiredExtraDocs = [], eligibility = {} } = req.body;
    if (!companyName || !role || !ctc || !registrationDeadline || !description) {
      return res.status(400).json({ message: 'Company, role, CTC, deadline, and description are required.' });
    }
    const deadlineDate = new Date(registrationDeadline);
    if (Number.isNaN(deadlineDate.getTime())) {
      return res.status(400).json({ message: 'Registration deadline must be a valid date.' });
    }
    if (deadlineDate <= new Date()) {
      return res.status(400).json({ message: 'Registration deadline must be in the future.' });
    }
    const drive = await Drive.create({
      company: companyName,
      role,
      category: req.body.category || 'Software Development',
      ctc: { total: ctc, baseSalary: ctc },
      eligibilityCriteria: {
        minCgpa: eligibility.minCgpa || 0,
        allowedDepartments: eligibility.allowedDepartments || [],
        maxBacklogs: eligibility.maxActiveBacklogs || eligibility.maxBacklogs || 0,
        minTenthMarks: eligibility.minTenthMarks || 0,
        minTwelfthMarks: eligibility.minTwelfthMarks || 0,
        openForAlreadyPlaced: Boolean(eligibility.openForAlreadyPlaced)
      },
      registrationDeadline: deadlineDate,
      driveDate: req.body.driveDate || deadlineDate,
      description,
      requiredExtraDocs
    });
    await groupController.createForDrive(drive, req.user._id);
    return res.status(201).json(toFrontend(drive));
  } catch (error) { return next(error); }
};

exports.update = async (req, res, next) => {
  try {
    const { companyName, role, ctc, registrationDeadline, description, requiredExtraDocs = [], eligibility = {} } = req.body;
    if (!companyName || !role || !ctc || !registrationDeadline || !description) {
      return res.status(400).json({ message: 'Company, role, CTC, deadline, and description are required.' });
    }
    const deadlineDate = new Date(registrationDeadline);
    if (Number.isNaN(deadlineDate.getTime())) {
      return res.status(400).json({ message: 'Registration deadline must be a valid date.' });
    }
    if (deadlineDate <= new Date()) {
      return res.status(400).json({ message: 'Registration deadline must be in the future.' });
    }
    const drive = await Drive.findByIdAndUpdate(
      req.params.id,
      {
        company: companyName.trim(),
        role: role.trim(),
        ctc: { total: ctc.trim(), baseSalary: ctc.trim() },
        registrationDeadline: deadlineDate,
        description: description.trim(),
        requiredExtraDocs,
        'eligibilityCriteria.minCgpa': Number(eligibility.minCgpa) || 0,
        'eligibilityCriteria.allowedDepartments': eligibility.allowedDepartments || []
      },
      { new: true, runValidators: true }
    );
    if (!drive) return res.status(404).json({ message: 'Drive not found.' });
    return res.json(toFrontend(drive));
  } catch (error) { return next(error); }
};

exports.remove = async (req, res, next) => {
  try {
    const drive = await Drive.findByIdAndDelete(req.params.id);
    if (!drive) return res.status(404).json({ message: 'Drive not found.' });
    await groupController.removeForDrive(drive._id);
    return res.json({ message: 'Drive deleted successfully.' });
  } catch (error) { return next(error); }
};

exports.updatePhase = async (req, res, next) => {
  try {
    const { phase, shortlistFileName } = req.body;
    if (!['OA', 'Interview', 'Final Selects'].includes(phase)) {
      return res.status(400).json({ message: 'Invalid drive phase.' });
    }
    const drive = await Drive.findByIdAndUpdate(
      req.params.id,
      { currentPhase: phase, ...(shortlistFileName ? { attachmentName: shortlistFileName } : {}) },
      { new: true }
    );
    if (!drive) return res.status(404).json({ message: 'Drive not found.' });
    return res.json({ success: true, message: `${phase} phase saved.`, drive: toFrontend(drive) });
  } catch (error) { return next(error); }
};
