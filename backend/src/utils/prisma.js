const { PrismaClient } = require('@prisma/client');

// One shared client for the whole app (it manages its own connection pool).
const prisma = new PrismaClient();

module.exports = prisma;
