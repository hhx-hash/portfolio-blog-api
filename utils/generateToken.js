const jwt = require('jsonwebtoken');

function generateToken(userId) {
  const payload = { id: userId };
  const options = { expiresIn: '1h', algorithm: 'HS256' };
  return jwt.sign(payload, process.env.JWT_SECRET, options);
}

module.exports = generateToken;
