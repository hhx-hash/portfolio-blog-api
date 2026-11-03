module.exports = function (req, res, next) {
  if (req.user.role !== 'admin') {
    res.status(403);
    return next(new Error('Admin access is required.'));
  }
  next();
};
