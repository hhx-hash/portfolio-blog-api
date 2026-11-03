module.exports = function (req, res, next) {
  res.status(404);
  const error = new Error('Route not found');
  next(error);
};
