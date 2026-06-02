const jwt = require('jsonwebtoken');
const baseConfig = require('../config/base.config');

const generateToken = (payload) => {
  return jwt.sign(payload, baseConfig.auth.secret, { expiresIn: '7d' });
};

const verifyToken = (token) => {
  return jwt.verify(token, baseConfig.auth.secret);
};

module.exports = { generateToken, verifyToken };
