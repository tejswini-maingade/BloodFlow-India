import { afterEach, expect, test } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import StatusBanner from './StatusBanner';

afterEach(cleanup);

const renderBanner = (props) =>
  render(
    <MemoryRouter>
      <StatusBanner {...props} />
    </MemoryRouter>
  );

test('lists the critical groups and links to the filtered search', () => {
  renderBanner({ criticalGroups: ['O-', 'AB-'], latestUpdate: new Date().toISOString() });
  expect(screen.getByText(/2 blood groups with critical stock/i)).toBeTruthy();
  expect(screen.getByText(/O-, AB-/)).toBeTruthy();
  expect(screen.getByRole('link', { name: /view critical stock/i }).getAttribute('href')).toBe(
    '/availability?risk=CRITICAL'
  );
});

test('shows the all-clear state with no link', () => {
  renderBanner({ criticalGroups: [], latestUpdate: null });
  expect(screen.getByText(/no critical stock/i)).toBeTruthy();
  expect(screen.queryByRole('link')).toBeNull();
});
