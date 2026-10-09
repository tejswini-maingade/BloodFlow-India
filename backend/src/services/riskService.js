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

module.exports = { calculateRisk, MODEL_LABEL };
