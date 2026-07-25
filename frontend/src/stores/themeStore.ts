import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  /** The actually applied theme ('light' | 'dark') — resolved from 'system' via media query */
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme): 'light' | 'dark' {
  const resolved = theme === 'system' ? getSystemTheme() : theme;
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(resolved);
  return resolved;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system',
      resolvedTheme: getSystemTheme(),
      setTheme: (theme) => {
        const resolved = applyTheme(theme);
        set({ theme, resolvedTheme: resolved });
      },
    }),
    {
      name: 'dm_theme', // persisted in localStorage
      onRehydrateStorage: () => (state) => {
        // Re-apply theme on page load after hydration
        if (state) {
          const resolved = applyTheme(state.theme);
          state.resolvedTheme = resolved;
        }
      },
    }
  )
);

/** Initialize theme on app boot (call this once in main.tsx or App.tsx) */
export function initTheme() {
  const stored = localStorage.getItem('dm_theme');
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as { state?: { theme?: Theme } };
      const theme: Theme = parsed?.state?.theme ?? 'system';
      applyTheme(theme);
    } catch {
      applyTheme('system');
    }
  } else {
    applyTheme('system');
  }

  // Listen for system preference changes when using 'system' mode
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const stored2 = localStorage.getItem('dm_theme');
    if (stored2) {
      try {
        const parsed2 = JSON.parse(stored2) as { state?: { theme?: Theme } };
        if (parsed2?.state?.theme === 'system') {
          applyTheme('system');
        }
      } catch {
        // ignore
      }
    }
  });
}
