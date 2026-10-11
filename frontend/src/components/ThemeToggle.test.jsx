import { afterEach, beforeEach, expect, test } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import ThemeToggle from './ThemeToggle';

beforeEach(() => {
  document.documentElement.setAttribute('data-theme', 'light');
  localStorage.clear();
});
afterEach(cleanup);

test('toggles the theme, updates the page and remembers the choice', () => {
  render(<ThemeToggle />);

  fireEvent.click(screen.getByRole('button'));
  expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  expect(localStorage.getItem('bloodflow_theme')).toBe('dark');

  fireEvent.click(screen.getByRole('button'));
  expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  expect(localStorage.getItem('bloodflow_theme')).toBe('light');
});
