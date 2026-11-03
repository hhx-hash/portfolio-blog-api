const express = require('express');
const controller = require('../controllers/contactController');
const protect = require('../middleware/protect');
const adminOnly = require('../middleware/adminOnly');
const limits = require('../middleware/limits');
const router = express.Router();

router.post('/', limits.contactLimit, controller.create);
router.get('/', protect, adminOnly, controller.list);

module.exports = router;
