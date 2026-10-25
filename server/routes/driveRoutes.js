const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');
const controller = require('../controllers/driveController');
router.get('/', controller.list);
router.get('/:id', controller.getById);
router.post('/', auth, allowRoles('tnp', 'head'), controller.create);
router.put('/:id/phase', auth, allowRoles('tnp'), controller.updatePhase);
module.exports = router;
