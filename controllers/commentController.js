const Comment = require('../models/Comment');

exports.list = async function (req, res) {
  const comments = await Comment.find({ post: req.post._id })
    .sort({ createdAt: 1 }).populate('author', 'username');
  res.json(comments);
};

exports.create = async function (req, res) {
  if (!req.body || typeof req.body.body !== 'string') {
    res.status(400);
    throw new Error('Send the comment body as text.');
  }
  const comment = await Comment.create({
    body: req.body.body,
    author: req.user._id,
    post: req.post._id
  });
  res.status(201).json(comment);
};

exports.remove = async function (req, res) {
  const comment = await Comment.findOne({
    _id: req.params.commentId, post: req.post._id
  });
  if (!comment) {
    res.status(404);
    throw new Error('Comment not found on this post.');
  }
  const wroteComment = comment.author.toString() === req.user._id.toString();
  const ownsPost = req.post.author.toString() === req.user._id.toString();
  if (!wroteComment && !ownsPost) {
    res.status(403);
    throw new Error('Only the comment author or post author can delete it.');
  }
  await comment.deleteOne();
  res.status(204).end();
};
