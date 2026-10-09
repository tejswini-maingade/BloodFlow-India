const rateLimit = require('express-rate-limit');
const config = require('../config');

const make = (options) =>
  rateLimit({
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => config.nodeEnv === 'test', // tests make many rapid calls
    handler: (req, res) =>
      res.status(429).json({
        success: false,
        error: { message: 'Too many requests, please try again later' },
      }),
    ...options,
  });

// General API protection
const apiLimiter = make({ windowMs: 15 * 60 * 1000, limit: 300 });

// Much stricter for login, to slow down password guessing
const loginLimiter = make({ windowMs: 15 * 60 * 1000, limit: 10 });

module.exports = { apiLimiter, loginLimiter };
