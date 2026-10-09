import { describe, expect, test } from 'vitest';
import { formatNumber, timeAgo } from './format';

const ago = (seconds) => new Date(Date.now() - seconds * 1000).toISOString();

describe('timeAgo', () => {
  test.each([
    [5, 'just now'],
    [3 * 60, '3 minutes ago'],
    [3600, '1 hour ago'],
    [3 * 3600, '3 hours ago'],
    [2 * 86400, '2 days ago'],
  ])('%i seconds -> %s', (seconds, expected) => {
    expect(timeAgo(ago(seconds))).toBe(expected);
  });
});

test('formatNumber uses Indian digit grouping', () => {
  expect(formatNumber(1234567)).toBe('12,34,567');
});
