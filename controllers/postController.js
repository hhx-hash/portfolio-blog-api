const Comment = require('../models/Comment');
const Post = require('../models/Post');

exports.list = async function (req, res) {
  const posts = await Post.find().populate('author', 'username');
  res.json(posts);
};

exports.detail = async function (req, res, next) {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'username');
    if (!post) {
      res.status(404);
      throw new Error('Post not found');
    }
    const comments = await Comment.find({ post: post._id })
      .sort({ createdAt: 1 }).populate('author', 'username');
    res.json({
      _id: post._id, title: post.title, content: post.content,
      author: post.author, createdAt: post.createdAt,
      updatedAt: post.updatedAt, comments: comments
    });
  } catch (error) {
    next(error);
  }
};

exports.create = async function (req, res) {
  const data = req.body;
  if (!data || typeof data.title !== 'string' ||
      typeof data.content !== 'string') {
    return res.status(400).json({
      error: { message: 'Send a title and content as text.' }
    });
  }
  const post = await Post.create({
    title: data.title, content: data.content,
    author: req.user._id.toString()
  });
  res.status(201).json(post);
};

exports.update = async function (req, res) {
  const data = req.body;
  if (!data || typeof data.title !== 'string' ||
      typeof data.content !== 'string') {
    return res.status(400).json({
      error: { message: 'Send a title and content as text.' }
    });
  }
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ error: { message: 'Post not found' } });
  }
  if (!post.author || post.author.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You can only update your own posts.');
  }
  post.title = data.title;
  post.content = data.content;
  await post.save();
  res.json(post);
};

exports.remove = async function (req, res) {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ error: { message: 'Post not found' } });
  }
  if (!post.author || post.author.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You can only delete your own posts.');
  }
  const comment = await Comment.findOne({ post: post._id });
  if (comment) {
    res.status(409);
    throw new Error('Remove the comments before deleting this post.');
  }
  await post.deleteOne();
  res.status(204).end();
};
