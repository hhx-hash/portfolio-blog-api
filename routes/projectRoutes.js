const express = require('express');
const controller = require('../controllers/projectController');
const protect = require('../middleware/protect');
const adminOnly = require('../middleware/adminOnly');
const router = express.Router();

router.get('/', controller.list);
router.get('/:id', controller.detail);
router.post('/', protect, adminOnly, controller.create);
router.put('/:id', protect, adminOnly, controller.update);
router.delete('/:id', protect, adminOnly, controller.remove);

module.exports = router;
