const { calculateRisk } = require('../src/services/riskService');

const T = { lowMin: 20, mediumMin: 10, highMin: 5 };

describe('calculateRisk', () => {
  test.each([
    [25, 'LOW'],
    [20, 'LOW'],
    [19, 'MEDIUM'],
    [10, 'MEDIUM'],
    [9, 'HIGH'],
    [5, 'HIGH'],
    [4, 'CRITICAL'],
    [0, 'CRITICAL'],
  ])('%i units -> %s', (units, expected) => {
    expect(calculateRisk(units, T).level).toBe(expected);
  });

  test('includes a reason and the demo-model label', () => {
    const result = calculateRisk(3, T);
    expect(result.reason).toMatch(/critical-stock threshold/);
    expect(result.model).toMatch(/not a medical prediction/i);
  });

  test('respects custom thresholds', () => {
    expect(calculateRisk(15, { lowMin: 50, mediumMin: 30, highMin: 20 }).level).toBe('CRITICAL');
  });

  test.each([-1, 2.5, '5', null, undefined])('rejects invalid input %p', (bad) => {
    expect(() => calculateRisk(bad, T)).toThrow(TypeError);
  });
});
