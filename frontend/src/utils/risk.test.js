import { describe, expect, test } from 'vitest';
import { groupCaption, groupStatus, riskRanges } from './risk';

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

describe('groupStatus', () => {
  test('critical beats low stock beats ok', () => {
    expect(groupStatus({ criticalCount: 1, lowStockCount: 3 })).toBe('critical');
    expect(groupStatus({ criticalCount: 0, lowStockCount: 2 })).toBe('high');
    expect(groupStatus({ criticalCount: 0, lowStockCount: 0 })).toBe('ok');
  });
});

describe('groupCaption', () => {
  test.each([
    [{ facilitiesTracked: 0, criticalCount: 0, lowStockCount: 0 }, 'Not tracked'],
    [{ facilitiesTracked: 14, criticalCount: 0, lowStockCount: 0 }, 'No shortages'],
    [{ facilitiesTracked: 14, criticalCount: 0, lowStockCount: 2 }, '2 low stock'],
    [{ facilitiesTracked: 14, criticalCount: 3, lowStockCount: 2 }, '3 critical · 2 low stock'],
  ])('%j -> %s', (group, expected) => {
    expect(groupCaption(group)).toBe(expected);
  });
});
