const Application = require('../models/Application');
const Drive = require('../models/Drive');
const Notification = require('../models/Notification');
const { toFrontend: driveToFrontend } = require('./driveController');

const toFrontend = (application) => {
  const a = application.toObject();
  const drive = a.driveId;
  return {
    id: a._id.toString(),
    driveId: drive._id.toString(),
    companyName: drive.company,
    companyLogo: drive.companyLogo || '',
    accentColor: drive.accentColor || '#2563EB',
    role: drive.role,
    appliedDate: a.appliedAt.toISOString(),
    status: a.status === 'Applied' ? 'Application Submitted' : a.status === 'Shortlisted' ? 'Shortlisted for Final' : a.status === 'Interview' ? 'Interview In-Progress' : a.status === 'Offered' ? 'Offer Extended' : a.status === 'Rejected' ? 'Not Shortlisted' : a.status,
    currentRound: drive.currentPhase,
    salaryDisplay: drive.ctc.total,
    canWithdraw: a.status === 'Applied',
    nextEventDate: a.nextEventDate ? a.nextEventDate.toISOString() : undefined,
    timeline: a.nextEventDate ? [{
      roundId: `${a._id}-next`,
      roundName: drive.currentPhase,
      status: 'scheduled',
      date: a.nextEventDate.toISOString(),
      time: a.nextEventTime,
      locationOrLink: a.nextEventLocationOrLink,
      instructions: a.nextEventInstructions
    }] : []
  };
};

exports.apply = async (req, res, next) => {
  try {
    const drive = await Drive.findById(req.body.driveId);
    if (!drive) return res.status(404).json({ message: 'Drive not found.' });
    if (drive.status === 'Closed' || drive.registrationDeadline <= new Date()) {
      return res.status(400).json({ message: 'The registration deadline for this drive has passed.' });
    }
    const criteria = drive.eligibilityCriteria;
    const student = req.user;
    const reasons = [];
    if ((student.cgpa || 0) < criteria.minCgpa) reasons.push(`CGPA ${student.cgpa || 0} is below the required ${criteria.minCgpa}.`);
    if ((student.activeBacklogs || 0) > criteria.maxBacklogs) reasons.push(`Active backlogs ${student.activeBacklogs || 0} exceed the maximum ${criteria.maxBacklogs}.`);
    if (criteria.allowedDepartments.length && !criteria.allowedDepartments.includes(student.department)) reasons.push(`Department ${student.department} is not eligible.`);
    if ((student.tenthPercentage || 0) < criteria.minTenthMarks) reasons.push(`10th percentage is below the required ${criteria.minTenthMarks}.`);
    if ((student.twelfthPercentage || 0) < criteria.minTwelfthMarks) reasons.push(`12th percentage is below the required ${criteria.minTwelfthMarks}.`);
    if (reasons.length) return res.status(403).json({ message: `Ineligible: ${reasons.join(' ')}`, reasons });
    try {
      const application = await Application.create({ studentId: student._id, driveId: drive._id });
      return res.status(201).json({ success: true, message: `Successfully applied to ${drive.company}.`, application: toFrontend({ ...application.toObject(), driveId: drive }) });
    } catch (error) {
      if (error.code === 11000) return res.status(409).json({ message: 'You have already applied to this drive.' });
      throw error;
    }
  } catch (error) { return next(error); }
};

exports.mine = async (req, res, next) => {
  try {
    const applications = await Application.find({ studentId: req.user._id }).populate('driveId');
    return res.json(applications.map(toFrontend));
  } catch (error) { return next(error); }
};

exports.byDrive = async (req, res, next) => {
  try {
    const applications = await Application.find({ driveId: req.params.driveId }).populate('studentId', 'name email rollNumber department cgpa');
    return res.json(applications);
  } catch (error) { return next(error); }
};

exports.publishShortlist = async (req, res, next) => {
  try {
    const drive = await Drive.findById(req.params.driveId);
    if (!drive) return res.status(404).json({ message: 'Drive not found.' });
    const identifiers = Array.isArray(req.body.identifiers) ? req.body.identifiers : [];
    const csv = typeof req.body.csv === 'string' ? req.body.csv : '';
    const csvIdentifiers = csv.split(/\r?\n/).flatMap((line) => line.split(',')).map((value) => value.trim()).filter(Boolean);
    const allIdentifiers = [...new Set([...identifiers, ...csvIdentifiers].map((value) => String(value).toLowerCase().trim()).filter(Boolean))];
    if (!allIdentifiers.length) return res.status(400).json({ message: 'Provide at least one student email, roll number, or CSV value.' });
    const applications = await Application.find({ driveId: drive._id }).populate('studentId', 'email rollNumber name');
    const selected = applications.filter((application) => {
      const email = application.studentId.email.toLowerCase();
      const rollNumber = String(application.studentId.rollNumber || '').toLowerCase();
      return allIdentifiers.includes(email) || allIdentifiers.includes(rollNumber);
    });
    if (!selected.length) return res.status(404).json({ message: 'No matching applicants were found for the supplied identifiers.' });
    const notes = typeof req.body.notes === 'string' ? req.body.notes.trim() : '';
    await Application.updateMany(
      { driveId: drive._id },
      { status: 'Rejected', shortlistPublishedAt: new Date() }
    );
    await Application.updateMany(
      { _id: { $in: selected.map((application) => application._id) } },
      { status: 'Shortlisted', shortlistPublishedAt: new Date(), ...(notes ? { shortlistNotes: notes } : {}) }
    );
    await Notification.deleteMany({ driveId: drive._id, type: 'shortlist' });
    await Notification.insertMany(selected.map((application) => ({
      studentId: application.studentId._id,
      title: `${drive.company} shortlist published`,
      body: `You have been shortlisted for ${drive.currentPhase} at ${drive.company}. ${notes}`.trim(),
      type: 'shortlist',
      driveId: drive._id
    })));
    return res.json({ success: true, shortlistedCount: selected.length, rejectedCount: applications.length - selected.length });
  } catch (error) { return next(error); }
};
