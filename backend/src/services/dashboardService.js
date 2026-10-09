const prisma = require('../utils/prisma');
const config = require('../config');
const { API_GROUPS, toApi } = require('../utils/bloodGroups');
const { calculateRisk, RISK_LEVELS } = require('./riskService');
const inventoryService = require('./inventoryService');

const RECENT_LIMIT = 8;

// Adds one stock row to a running total. "Low stock" = HIGH risk, "critical" = CRITICAL risk.
function tally(target, level, units) {
  target.totalUnits += units;
  if (level === 'HIGH') target.lowStockCount += 1;
  if (level === 'CRITICAL') target.criticalCount += 1;
}

// Pure function (no database calls), so it is easy to reason about and test.
function buildSummary(rows, totalFacilities) {
  const riskDistribution = Object.fromEntries(RISK_LEVELS.map((l) => [l, 0]));
  const overall = { totalUnits: 0, lowStockCount: 0, criticalCount: 0 };

  // Every blood group appears, even with zero stock.
  const groups = new Map(
    API_GROUPS.map((g) => [g, { bloodGroup: g, totalUnits: 0, lowStockCount: 0, criticalCount: 0 }])
  );
  const locations = new Map();

  for (const row of rows) {
    const { level } = calculateRisk(row.unitsAvailable);
    const { city, state, id: facilityId } = row.facility;

    riskDistribution[level] += 1;
    tally(overall, level, row.unitsAvailable);
    tally(groups.get(toApi(row.bloodGroup)), level, row.unitsAvailable);

    const key = `${city}|${state}`;
    if (!locations.has(key)) {
      locations.set(key, { city, state, totalUnits: 0, lowStockCount: 0, criticalCount: 0, facilityIds: new Set() });
    }
    const loc = locations.get(key);
    tally(loc, level, row.unitsAvailable);
    loc.facilityIds.add(facilityId);
  }

  const recentUpdates = [...rows]
    .sort((a, b) => b.updatedAt - a.updatedAt || b.id - a.id)
    .slice(0, RECENT_LIMIT)
    .map(inventoryService.serialize);

  return {
    totals: { ...overall, totalFacilities },
    riskDistribution,
    bloodGroups: [...groups.values()],
    locations: [...locations.values()]
      .map(({ facilityIds, ...loc }) => ({ ...loc, facilities: facilityIds.size }))
      .sort((a, b) => a.city.localeCompare(b.city)),
    recentUpdates,
    riskThresholds: { ...config.risk }, // lets the UI show a legend without hardcoding numbers
  };
}

async function getDashboard() {
  const [rows, totalFacilities] = await Promise.all([
    prisma.bloodInventory.findMany({ include: inventoryService.include }),
    prisma.facility.count(),
  ]);
  return buildSummary(rows, totalFacilities);
}

module.exports = { getDashboard, buildSummary };
