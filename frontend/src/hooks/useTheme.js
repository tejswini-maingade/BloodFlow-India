import { useCallback, useEffect, useState } from 'react';

const KEY = 'bloodflow_theme';

// theme-init.js already set data-theme before React started, so we just read it.
function initialTheme() {
  const applied = document.documentElement.getAttribute('data-theme');
  if (applied === 'dark' || applied === 'light') return applied;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useTheme() {
  const [theme, setTheme] = useState(initialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  const toggle = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try {
      localStorage.setItem(KEY, next); // a theme choice is not sensitive, so localStorage is fine
    } catch {
      /* storage unavailable: the choice just won't persist */
    }
  }, [theme]);

  return { theme, toggle };
}
