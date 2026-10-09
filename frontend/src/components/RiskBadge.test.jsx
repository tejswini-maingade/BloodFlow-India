import { afterEach, describe, expect, test } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import RiskBadge from './RiskBadge';

afterEach(cleanup);

describe('RiskBadge', () => {
  test('shows the level as text, not just colour', () => {
    render(<RiskBadge level="CRITICAL" />);
    expect(screen.getByText('CRITICAL').className).toMatch(/badge-critical/);
  });

  test('exposes the reason as a tooltip', () => {
    render(<RiskBadge level="HIGH" reason="Below the medium-risk threshold" />);
    expect(screen.getByText('HIGH').getAttribute('title')).toBe('Below the medium-risk threshold');
  });
});
