import { describe, expect, test } from 'vitest';
import { riskRanges } from './risk';

describe('riskRanges', () => {
  test('builds legend text from the thresholds the backend reports', () => {
    expect(riskRanges({ lowMin: 20, mediumMin: 10, highMin: 5 })).toEqual({
      LOW: '20+ units',
      MEDIUM: '10 to 19 units',
      HIGH: '5 to 9 units',
      CRITICAL: 'under 5 units',
    });
  });

  test('follows custom thresholds (nothing is hardcoded)', () => {
    expect(riskRanges({ lowMin: 50, mediumMin: 30, highMin: 15 }).HIGH).toBe('15 to 29 units');
  });
});
