const User = require('../models/User');
const Application = require('../models/Application');

exports.getPlacementStats = async (req, res, next) => {
  try {
    const [totalStudentsEligible, totalOffers, branchWiseStats] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Application.countDocuments({ status: 'Offered' }),
      User.aggregate([
        { $match: { role: 'student', department: { $exists: true, $ne: '' } } },
        { $group: { _id: '$department', students: { $sum: 1 }, placed: { $sum: { $cond: [{ $eq: ['$placementStatus', 'placed'] }, 1, 0] } } } },
        { $project: { _id: 0, branch: '$_id', percentage: { $cond: [{ $eq: ['$students', 0] }, 0, { $multiply: [{ $divide: ['$placed', '$students'] }, 100] }] }, averagePackage: { $literal: 'N/A' }, highestPackage: { $literal: 'N/A' } } }
      ])
    ]);
    return res.json({
      academicYear: new Date().getFullYear().toString(),
      totalStudentsEligible,
      totalOffers,
      highestPackage: 'N/A',
      averagePackage: 'N/A',
      medianPackage: 'N/A',
      placementPercentage: totalStudentsEligible ? Number(((totalOffers / totalStudentsEligible) * 100).toFixed(1)) : 0,
      topRecruiters: [],
      branchWiseStats
    });
  } catch (error) {
    return next(error);
  }
};
