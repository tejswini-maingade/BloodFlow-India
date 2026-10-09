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
