export const RISK_ORDER = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

// Builds the legend text from the thresholds the BACKEND reports, so numbers are never hardcoded here.
export function riskRanges(t) {
  return {
    LOW: `${t.lowMin}+ units`,
    MEDIUM: `${t.mediumMin} to ${t.lowMin - 1} units`,
    HIGH: `${t.highMin} to ${t.mediumMin - 1} units`,
    CRITICAL: `under ${t.highMin} units`,
  };
}

// Colour of a blood group's droplet: the worst status among its facilities.
export function groupStatus(g) {
  if (g.criticalCount > 0) return 'critical';
  if (g.lowStockCount > 0) return 'high';
  return 'ok';
}

export function groupCaption(g) {
  if (g.facilitiesTracked === 0) return 'Not tracked';
  const parts = [];
  if (g.criticalCount > 0) parts.push(`${g.criticalCount} critical`);
  if (g.lowStockCount > 0) parts.push(`${g.lowStockCount} low stock`);
  return parts.length > 0 ? parts.join(' · ') : 'No shortages';
}
