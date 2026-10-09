const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');
const config = require('../config');
const ApiError = require('../utils/ApiError');

// Compared against when the email is unknown, so response time doesn't reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);

async function login(email, password) {
  const user = await prisma.user.findUnique({ where: { email } });
  const passwordOk = await bcrypt.compare(password, user ? user.passwordHash : DUMMY_HASH);

  // Same message for "no such user" and "wrong password" on purpose.
  if (!user || !passwordOk) throw new ApiError(401, 'Invalid email or password');

  const token = jwt.sign({ role: user.role }, config.jwt.secret, {
    subject: String(user.id),
    expiresIn: config.jwt.expiresIn,
    algorithm: 'HS256',
  });

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
}

module.exports = { login };
