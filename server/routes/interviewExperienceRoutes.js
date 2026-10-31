const router = require('express').Router();
const controller = require('../controllers/interviewExperienceController');

router.get('/', controller.list);
router.get('/:id', controller.getById);

module.exports = router;
