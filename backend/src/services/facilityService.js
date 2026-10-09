const prisma = require('../utils/prisma');
const ApiError = require('../utils/ApiError');
const { toApi } = require('../utils/bloodGroups');
const { calculateRisk, RISK_LEVELS } = require('./riskService');

// Highest-severity risk among a facility's stock rows (null if it tracks nothing yet).
function worstRisk(rows) {
  let worst = -1;
  for (const row of rows) {
    worst = Math.max(worst, RISK_LEVELS.indexOf(calculateRisk(row.unitsAvailable).level));
  }
  return worst === -1 ? null : RISK_LEVELS[worst];
}

function stats(rows) {
  return {
    totalUnits: rows.reduce((sum, r) => sum + r.unitsAvailable, 0),
    groupsTracked: rows.length,
    worstRisk: worstRisk(rows),
  };
}

async function list({ city, type }) {
  const where = {};
  if (type) where.type = type;
  if (city) where.city = { equals: city, mode: 'insensitive' };

  const facilities = await prisma.facility.findMany({
    where,
    include: { inventory: { select: { unitsAvailable: true } } },
    orderBy: [{ city: 'asc' }, { name: 'asc' }],
  });

  // The raw inventory rows are only used to compute stats, so they are not returned.
  return facilities.map(({ inventory, ...facility }) => ({ ...facility, stats: stats(inventory) }));
}

async function getById(id) {
  const facility = await prisma.facility.findUnique({
    where: { id },
    include: { inventory: { orderBy: [{ unitsAvailable: 'asc' }, { id: 'asc' }] } },
  });
  if (!facility) throw new ApiError(404, 'Facility not found');

  const { inventory, ...rest } = facility;
  return {
    ...rest,
    stats: stats(inventory),
    inventory: inventory.map((row) => {
      const { level, reason } = calculateRisk(row.unitsAvailable);
      return {
        id: row.id,
        bloodGroup: toApi(row.bloodGroup),
        unitsAvailable: row.unitsAvailable,
        risk: { level, reason },
        updatedAt: row.updatedAt,
      };
    }),
  };
}

module.exports = { list, getById };
