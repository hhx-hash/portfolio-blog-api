const generateToken = require('../utils/generateToken');
const User = require('../models/User');
const bcrypt = require('bcrypt');

exports.register = async function (req, res, next) {
  try {
    const data = req.body;
    if (!data || typeof data.username !== 'string' ||
        typeof data.email !== 'string' || typeof data.password !== 'string') {
      res.status(400);
      throw new Error('Send username, email, and password as text.');
    }
    if (data.password.length < 8 || Buffer.byteLength(data.password, 'utf8') > 72) {
      res.status(400);
      throw new Error('Use at least 8 characters and at most 72 bytes for password.');
    }
    const hash = await bcrypt.hash(data.password, 12);
    const user = await User.create({
      username: data.username, email: data.email, password: hash
    });
    res.status(201).json({
      id: user._id, username: user.username, email: user.email, role: user.role
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async function (req, res) {
  const data = req.body;
  if (!data || typeof data.email !== 'string' ||
      typeof data.password !== 'string') {
    res.status(400);
    throw new Error('Send email and password as text.');
  }
  const email = data.email.trim().toLowerCase();
  const user = await User.findOne({ email: email }).select('+password');
  if (!user) {
    res.status(401);
    throw new Error('Email or password is incorrect.');
  }
  const matches = await bcrypt.compare(data.password, user.password);
  if (!matches) {
    res.status(401);
    throw new Error('Email or password is incorrect.');
  }
  const token = generateToken(user._id);
  res.json({
    token: token,
    user: {
      id: user._id, username: user.username, email: user.email, role: user.role
    }
  });
};

exports.me = function (req, res) {
  res.json({
    id: req.user._id,
    username: req.user.username,
    email: req.user.email,
    role: req.user.role
  });
};
