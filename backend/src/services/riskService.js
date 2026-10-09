const config = require('../config');

const MODEL_LABEL = 'MVP/demo rule-based risk model. Not a medical prediction.';

/**
 * Calculates shortage risk from available units using configurable thresholds.
 * Pure function: same input, same output, which makes it easy to test.
 */
function calculateRisk(units, t = config.risk) {
  if (!Number.isInteger(units) || units < 0) {
    throw new TypeError('units must be a non-negative integer');
  }

  let level;
  let reason;

  if (units >= t.lowMin) {
    level = 'LOW';
    reason = `Availability (${units} units) is at or above the configured low-risk threshold of ${t.lowMin} units.`;
  } else if (units >= t.mediumMin) {
    level = 'MEDIUM';
    reason = `Availability (${units} units) is below ${t.lowMin} but at or above the medium-risk threshold of ${t.mediumMin} units.`;
  } else if (units >= t.highMin) {
    level = 'HIGH';
    reason = `Availability (${units} units) is below ${t.mediumMin} but at or above the high-risk threshold of ${t.highMin} units.`;
  } else {
    level = 'CRITICAL';
    reason = `Current availability (${units} units) is below the configured critical-stock threshold of ${t.highMin} units.`;
  }

  return { level, reason, model: MODEL_LABEL };
}

const RISK_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

/**
 * Converts a risk level into a range of units, so the database can filter by
 * risk using the SAME thresholds as calculateRisk (no duplicated numbers).
 */
function unitRangeForRisk(level, t = config.risk) {
  switch (level) {
    case 'LOW': return { gte: t.lowMin };
    case 'MEDIUM': return { gte: t.mediumMin, lt: t.lowMin };
    case 'HIGH': return { gte: t.highMin, lt: t.mediumMin };
    case 'CRITICAL': return { lt: t.highMin };
    default: throw new TypeError(`Unknown risk level: ${level}`);
  }
}

module.exports = { calculateRisk, unitRangeForRisk, RISK_LEVELS, MODEL_LABEL };
