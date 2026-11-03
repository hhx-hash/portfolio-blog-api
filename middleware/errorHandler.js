module.exports = function (error, req, res, next) {
  let status = res.statusCode;
  let message = 'Server error. Please try again later.';
  if (status >= 400 && status < 500) {
    message = error.message;
  } else {
    status = 500;
  }
  if (error.name === 'ValidationError') {
    status = 400;
    message = 'Check the required fields, lengths, and formats.';
  }
  if (error.name === 'CastError') {
    status = 400;
    message = 'Use a valid document ID and field values.';
  }
  if (error.code === 11000) {
    status = 409;
    message = 'That username or email is already in use.';
  }
  if (error.type === 'entity.parse.failed') {
    status = 400;
    message = 'Send valid JSON.';
  }
  if (error.type === 'entity.too.large') {
    status = 413;
    message = 'The request body is too large.';
  }
  res.status(status).json({ error: { message: message } });
};
