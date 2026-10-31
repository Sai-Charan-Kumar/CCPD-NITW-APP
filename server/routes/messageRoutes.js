const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const controller = require('../controllers/messageController');
const requireGroupMembership = require('../middleware/groupMembership');

router.use(auth);
router.get('/:groupId', requireGroupMembership, controller.list);
router.post('/:groupId', requireGroupMembership, controller.create);

module.exports = router;
