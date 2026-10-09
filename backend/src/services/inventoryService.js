const prisma = require('../utils/prisma');
const ApiError = require('../utils/ApiError');
const { toApi, toDb } = require('../utils/bloodGroups');
const { calculateRisk, unitRangeForRisk } = require('./riskService');

const include = {
  facility: { select: { id: true, name: true, type: true, city: true, state: true } },
};

const RANK = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };

// Shape of one inventory row as the API returns it (risk is computed here, never stored).
function serialize(row) {
  const { level, reason } = calculateRisk(row.unitsAvailable);
  return {
    id: row.id,
    facility: row.facility,
    bloodGroup: toApi(row.bloodGroup),
    unitsAvailable: row.unitsAvailable,
    risk: { level, reason },
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

// Creates an alert only when a row becomes HIGH/CRITICAL or gets worse.
async function recordAlertIfNeeded(tx, row, previousLevel) {
  const { level } = calculateRisk(row.unitsAvailable);
  const needsAlert = RANK[level] >= RANK.HIGH && (previousLevel === null || RANK[level] > RANK[previousLevel]);
  if (!needsAlert) return;

  await tx.alert.create({
    data: {
      bloodGroup: row.bloodGroup,
      location: `${row.facility.city}, ${row.facility.state}`,
      riskLevel: level,
      message: `${toApi(row.bloodGroup)} stock at ${row.facility.name} is ${level} (${row.unitsAvailable} units).`,
    },
  });
}

async function list({ bloodGroup, city, risk }) {
  const where = {};
  if (bloodGroup) where.bloodGroup = toDb(bloodGroup);
  if (risk) where.unitsAvailable = unitRangeForRisk(risk);
  if (city) where.facility = { city: { equals: city, mode: 'insensitive' } };

  const rows = await prisma.bloodInventory.findMany({
    where,
    include,
    orderBy: [{ unitsAvailable: 'asc' }, { id: 'asc' }], // most urgent first
  });
  return rows.map(serialize);
}

async function getById(id) {
  const row = await prisma.bloodInventory.findUnique({ where: { id }, include });
  if (!row) throw new ApiError(404, 'Inventory record not found');
  return serialize(row);
}

async function create({ facilityId, bloodGroup, unitsAvailable }) {
  const facility = await prisma.facility.findUnique({ where: { id: facilityId } });
  if (!facility) throw new ApiError(400, 'Facility does not exist');

  return prisma.$transaction(async (tx) => {
    const row = await tx.bloodInventory.create({
      data: { facilityId, bloodGroup: toDb(bloodGroup), unitsAvailable },
      include,
    });
    await recordAlertIfNeeded(tx, row, null);
    return serialize(row);
  });
}

async function update(id, unitsAvailable) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.bloodInventory.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, 'Inventory record not found');

    const row = await tx.bloodInventory.update({ where: { id }, data: { unitsAvailable }, include });
    await recordAlertIfNeeded(tx, row, calculateRisk(existing.unitsAvailable).level);
    return serialize(row);
  });
}

async function remove(id) {
  // Prisma throws P2025 if the row doesn't exist; the error handler turns it into a 404.
  await prisma.bloodInventory.delete({ where: { id } });
}

module.exports = { list, getById, create, update, remove, serialize, include };
