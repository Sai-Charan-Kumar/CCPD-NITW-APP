const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const controller = require('../controllers/userController');
router.use(auth);
router.get('/me', controller.getMe);
router.get('/profile', controller.getStudentProfile);
module.exports = router;
