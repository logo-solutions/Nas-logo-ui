---
name: dark-mode-implementation
description: Implement dark mode with proper theming and user preferences. Use when adding dark mode support or managing theme switching.
---

# Dark Mode Implementation

## Overview

Dark mode requires more than flipping colors—it's about maintaining hierarchy, contrast, and readability while respecting user preferences.

## When to Use

- Adding dark mode support
- Implementing theme switching
- Managing color token variants
- Testing light/dark appearance

## CSS Variables Strategy

```css
/* styles/tokens.css */
:root {
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-900: #111827;

  /* Semantic colors - Light mode */
  --color-surface: var(--color-gray-50);
  --color-surface-secondary: var(--color-gray-100);
  --color-text-primary: var(--color-gray-900);
  --color-text-secondary: var(--color-gray-600);
  --color-border: var(--color-gray-200);
  --color-background: var(--color-gray-50);
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-surface: var(--color-gray-900);
    --color-surface-secondary: var(--color-gray-800);
    --color-text-primary: var(--color-gray-50);
    --color-text-secondary: var(--color-gray-400);
    --color-border: var(--color-gray-700);
    --color-background: var(--color-gray-950);
  }
}

[data-theme="dark"] {
  --color-surface: var(--color-gray-900);
  --color-surface-secondary: var(--color-gray-800);
  --color-text-primary: var(--color-gray-50);
  --color-text-secondary: var(--color-gray-400);
  --color-border: var(--color-gray-700);
  --color-background: var(--color-gray-950);
}

[data-theme="light"] {
  --color-surface: var(--color-gray-50);
  --color-surface-secondary: var(--color-gray-100);
  --color-text-primary: var(--color-gray-900);
  --color-text-secondary: var(--color-gray-600);
  --color-border: var(--color-gray-200);
  --color-background: var(--color-gray-50);
}
```

## Theme Context Implementation

```typescript
// ThemeContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [isDark, setIsDark] = useState(false);

  // Load theme from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored) setThemeState(stored);
  }, []);

  // Listen to system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const updateDarkMode = () => {
      const isDarkMode = theme === 'dark' || 
        (theme === 'system' && mediaQuery.matches);
      
      setIsDark(isDarkMode);
      document.documentElement.setAttribute(
        'data-theme',
        isDarkMode ? 'dark' : 'light'
      );
    };

    updateDarkMode();
    mediaQuery.addEventListener('change', updateDarkMode);
    return () => mediaQuery.removeEventListener('change', updateDarkMode);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

## Theme Switcher Component

```typescript
// ThemeSwitcher.tsx
import { useTheme } from './ThemeContext';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="theme-select" className="text-sm font-medium">
        Theme:
      </label>
      <select
        id="theme-select"
        value={theme}
        onChange={(e) => setTheme(e.target.value as any)}
        className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700"
      >
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  );
}
```

## Tailwind Dark Mode Configuration

```javascript
// tailwind.config.js
export default {
  darkMode: 'class', // or 'media'
  theme: {
    extend: {
      colors: {
        // Use semantic naming for dark mode
        surface: {
          light: '#f9fafb',
          dark: '#111827',
        },
      },
    },
  },
};
```

```tsx
// Using Tailwind dark mode
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-50">
  {/* Content */}
</div>
```

## Component-Level Dark Mode Support

```typescript
// Card.tsx
import { cn } from './utils';

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800',
        'border border-gray-200 dark:border-gray-700',
        'rounded-lg shadow-sm',
        'p-4',
        className
      )}
    >
      {children}
    </div>
  );
}
```

## Dark Mode Contrast Verification

```typescript
// lib/contrast.ts
export function getContrastRatio(color1: string, color2: string): number {
  // Calculate luminance
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

function getLuminance(hex: string): number {
  const [r, g, b] = hex.match(/\w\w/g)!.map(x => parseInt(x, 16) / 255);
  
  const [rs, gs, bs] = [r, g, b].map(c =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );
  
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Test
const ratio = getContrastRatio('#ffffff', '#111827');
console.assert(ratio >= 4.5, 'Insufficient contrast for WCAG AA');
```

## Dark Mode Testing

```typescript
// Card.test.tsx
import { render } from '@testing-library/react';
import { ThemeProvider } from './ThemeContext';
import { Card } from './Card';

describe('Card Dark Mode', () => {
  it('applies correct colors in light mode', () => {
    render(
      <ThemeProvider>
        <div data-theme="light">
          <Card>Content</Card>
        </div>
      </ThemeProvider>
    );
    
    const card = screen.getByText('Content').parentElement;
    expect(card).toHaveClass('bg-white');
  });

  it('applies correct colors in dark mode', () => {
    render(
      <ThemeProvider>
        <div data-theme="dark">
          <Card>Content</Card>
        </div>
      </ThemeProvider>
    );
    
    const card = screen.getByText('Content').parentElement;
    expect(card).toHaveClass('bg-gray-800');
  });

  it('maintains contrast in both modes', () => {
    const lightContrast = getContrastRatio('#ffffff', '#f9fafb');
    const darkContrast = getContrastRatio('#111827', '#000000');
    
    expect(lightContrast).toBeGreaterThanOrEqual(4.5);
    expect(darkContrast).toBeGreaterThanOrEqual(4.5);
  });
});
```

## Dark Mode Best Practices

- [ ] Test every component in both light and dark modes
- [ ] Use CSS variables for colors, not hardcoded values
- [ ] Maintain sufficient contrast (4.5:1 for normal text)
- [ ] Avoid pure black (#000000) in dark mode (use #111827 or similar)
- [ ] Avoid pure white (#ffffff) in light mode shadows
- [ ] Test images in dark mode (they may need filters)
- [ ] Respect system preference initially
- [ ] Allow manual override
- [ ] Persist user choice to localStorage
- [ ] Don't rely on color alone to convey information
- [ ] Test with color blindness simulators
