const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function (req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401);
    return next(new Error('Send a Bearer token.'));
  }
  const token = header.split(' ')[1];
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256']
    });
  } catch (error) {
    res.status(401);
    return next(new Error('Token is invalid or expired.'));
  }
  req.user = await User.findById(decoded.id).select('username email role');
  if (!req.user) {
    res.status(401);
    return next(new Error('The account no longer exists.'));
  }
  next(); // The controller can now use req.user.
};
