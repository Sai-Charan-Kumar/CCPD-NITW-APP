const InterviewExperience = require('../models/InterviewExperience');

const toFrontend = (experience) => {
  const value = experience.toObject();
  return { ...value, id: value._id.toString(), postedDate: value.postedDate.toISOString() };
};

exports.list = async (req, res, next) => {
  try {
    const experiences = await InterviewExperience.find().sort({ postedDate: -1 });
    return res.json(experiences.map(toFrontend));
  } catch (error) {
    return next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const experience = await InterviewExperience.findById(req.params.id);
    if (!experience) return res.status(404).json({ message: 'Interview experience not found.' });
    return res.json(toFrontend(experience));
  } catch (error) {
    return next(error);
  }
};
