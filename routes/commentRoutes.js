const express = require('express');
const controller = require('../controllers/commentController');
const protect = require('../middleware/protect');
const findCommentPost = require('../middleware/findCommentPost');
const router = express.Router({ mergeParams: true });

router.use(findCommentPost);
router.get('/', controller.list);
router.post('/', protect, controller.create);
router.delete('/:commentId', protect, controller.remove);

module.exports = router;
