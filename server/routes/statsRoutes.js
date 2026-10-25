const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const controller = require('../controllers/statsController');
router.get('/', auth, controller.getPlacementStats);
module.exports = router;
