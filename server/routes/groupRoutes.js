const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const controller = require('../controllers/groupController');

router.get('/my-groups', auth, controller.listMine);

module.exports = router;
