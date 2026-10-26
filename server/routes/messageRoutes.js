const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const controller = require('../controllers/messageController');

router.use(auth);
router.get('/:groupId', controller.list);
router.post('/:groupId', controller.create);

module.exports = router;
