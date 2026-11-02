const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');
const controller = require('../controllers/applicationController');
router.post('/apply', auth, allowRoles('student', 'tnp'), controller.apply);
router.get('/my-applications', auth, allowRoles('student', 'tnp'), controller.mine);
router.get('/drive/:driveId', auth, allowRoles('tnp', 'head'), controller.byDrive);
router.post('/drive/:driveId/shortlist', auth, allowRoles('tnp', 'head'), controller.publishShortlist);
module.exports = router;
