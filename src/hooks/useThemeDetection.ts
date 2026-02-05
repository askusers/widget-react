import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

function detectTheme(): Theme {
  if (typeof window === 'undefined') return 'light';

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') return 'light';
  if (savedTheme === 'dark') return 'dark';

  const dataTheme = document.documentElement.dataset.theme;
  if (dataTheme === 'dark') return 'dark';
  if (dataTheme === 'light') return 'light';

  if (document.documentElement.classList.contains('dark')) return 'dark';
  if (document.documentElement.classList.contains('light')) return 'light';

  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
}

/**
 * Hook to detect and track the current theme (light/dark).
 * Monitors localStorage, data-theme attribute, class changes, and system preference.
 */
export function useThemeDetection(forceTheme?: 'light' | 'dark' | 'auto'): Theme {
  const [theme, setTheme] = useState<Theme>(() => {
    if (forceTheme && forceTheme !== 'auto') return forceTheme;
    return detectTheme();
  });

  useEffect(() => {
    if (forceTheme && forceTheme !== 'auto') {
      setTheme(forceTheme);
      return;
    }

    const updateTheme = () => {
      setTheme(detectTheme());
    };

    updateTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const observer = new MutationObserver((mutations) => {
      const hasThemeChange = mutations.some(mutation => {
        if (mutation.type === 'attributes') {
          return mutation.attributeName === 'class' || mutation.attributeName === 'data-theme';
        }
        return false;
      });

      if (hasThemeChange) {
        setTimeout(updateTheme, 0);
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    });

    mediaQuery.addEventListener('change', updateTheme);

    const handleCustomThemeChange = () => {
      setTimeout(updateTheme, 10);
    };
    window.addEventListener('themechange', handleCustomThemeChange);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', updateTheme);
      window.removeEventListener('themechange', handleCustomThemeChange);
    };
  }, [forceTheme]);

  return theme;
}
