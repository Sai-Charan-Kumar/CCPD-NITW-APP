const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');
const controller = require('../controllers/noticeController');
router.get('/', controller.list);
router.post('/', auth, allowRoles('tnp', 'head'), controller.create);
module.exports = router;
