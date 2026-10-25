const { publicUser } = require('./authController');

exports.getMe = async (req, res) => {
  res.json({ user: publicUser(req.user) });
};

exports.getStudentProfile = async (req, res) => {
  const user = req.user;
  res.json({
    id: user._id.toString(),
    name: user.name,
    rollNumber: user.rollNumber || '',
    registrationNumber: user.rollNumber || '',
    email: user.email,
    phone: user.phone || '',
    department: user.department,
    degree: 'B.Tech',
    batch: '2026',
    cgpa: user.cgpa || 0,
    activeBacklogs: user.activeBacklogs || 0,
    placementStatus: user.placementStatus,
    currentOffers: [],
    resume: { fileName: '', updatedAt: '', verified: false, url: '' },
    skills: [],
    tenthPercentage: user.tenthPercentage || 0,
    twelfthPercentage: user.twelfthPercentage || 0,
    isVerifiedByCCPD: user.isVerifiedByCCPD
  });
};
