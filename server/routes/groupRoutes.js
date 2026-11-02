const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const controller = require('../controllers/groupController');

router.get('/mine', auth, controller.mine);
router.get('/my-groups', auth, controller.mine);

module.exports = router;
