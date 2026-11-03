const rateLimit = require('express-rate-limit').rateLimit;

exports.authLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: 'Too many attempts. Try again in 15 minutes.' } }
});

exports.contactLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: 'Too many messages. Try again in 15 minutes.' } }
});
