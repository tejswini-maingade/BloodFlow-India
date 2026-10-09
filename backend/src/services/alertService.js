const prisma = require('../utils/prisma');
const { toApi } = require('../utils/bloodGroups');

async function list(limit) {
  const alerts = await prisma.alert.findMany({
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: limit,
  });
  return alerts.map((a) => ({
    id: a.id,
    bloodGroup: toApi(a.bloodGroup),
    location: a.location,
    riskLevel: a.riskLevel,
    message: a.message,
    createdAt: a.createdAt,
  }));
}

module.exports = { list };
