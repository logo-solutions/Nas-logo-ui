---
name: responsive-design-patterns
description: Build responsive interfaces that work across all devices and screen sizes. Use when implementing mobile-first layouts, handling breakpoints, or ensuring device compatibility.
---

# Responsive Design Patterns

## Overview

Responsive design means building interfaces that adapt gracefully to any screen size. Mobile-first development ensures core functionality works everywhere.

## When to Use

- Building layouts
- Adapting to different screen sizes
- Implementing mobile-specific features
- Testing on real devices
- Optimizing for performance

## Breakpoint Strategy

Define breakpoints based on content, not devices:

```typescript
// breakpoints.ts
export const BREAKPOINTS = {
  xs: 320,    // Mobile
  sm: 640,    // Tablet
  md: 1024,   // Small desktop
  lg: 1280,   // Desktop
  xl: 1536,   // Large desktop
} as const;
```

## Mobile-First with Tailwind

```html
<!-- Base styles (mobile) -->
<div class="
  grid grid-cols-1 gap-4 p-4
  text-base
">
  <!-- Content -->
</div>

<!-- Tablet and up -->
<div class="
  grid grid-cols-1 gap-4 p-4
  sm:grid-cols-2 sm:gap-6 sm:p-6
  text-base sm:text-lg
">
  <!-- Content -->
</div>

<!-- Desktop and up -->
<div class="
  grid grid-cols-1 gap-4 p-4
  sm:grid-cols-2 sm:gap-6 sm:p-6
  lg:grid-cols-3 lg:gap-8 lg:p-8
  text-base sm:text-lg lg:text-xl
">
  <!-- Content -->
</div>
```

## Responsive Component Pattern

```typescript
// Card.tsx
export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        // Mobile
        'flex flex-col gap-2 p-4 rounded',
        // Tablet
        'sm:flex-row sm:gap-4 sm:p-6',
        // Desktop
        'lg:gap-6 lg:p-8',
        className
      )}
    >
      {children}
    </div>
  );
}
```

## Responsive Grid System

```typescript
// Grid.tsx
export interface GridProps {
  children: React.ReactNode;
  cols?: {
    default: 1 | 2 | 3 | 4;
    sm?: 1 | 2 | 3 | 4;
    md?: 1 | 2 | 3 | 4;
    lg?: 1 | 2 | 3 | 4;
  };
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Grid({ children, cols = { default: 1, sm: 2, lg: 3 }, gap = 'md' }: GridProps) {
  const gapClass = {
    sm: 'gap-2 sm:gap-3 lg:gap-4',
    md: 'gap-4 sm:gap-6 lg:gap-8',
    lg: 'gap-6 sm:gap-8 lg:gap-12',
  }[gap];

  const colsClass = `
    grid-cols-${cols.default}
    ${cols.sm ? `sm:grid-cols-${cols.sm}` : ''}
    ${cols.md ? `md:grid-cols-${cols.md}` : ''}
    ${cols.lg ? `lg:grid-cols-${cols.lg}` : ''}
  `;

  return (
    <div className={`grid ${colsClass} ${gapClass}`}>
      {children}
    </div>
  );
}
```

## useMediaQuery Hook

```typescript
// useMediaQuery.ts
import { useEffect, useState } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    mediaQuery.addEventListener('change', listener);

    return () => mediaQuery.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

// Usage
export function useIsMobile() {
  return useMediaQuery('(max-width: 640px)');
}

export function useIsTablet() {
  return useMediaQuery('(min-width: 641px) and (max-width: 1023px)');
}

export function useIsDesktop() {
  return useMediaQuery('(min-width: 1024px)');
}
```

## Responsive Navigation

```typescript
// Navigation.tsx
import { useIsMobile } from './hooks/useMediaQuery';
import { useState } from 'react';

export function Navigation() {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white border-b">
      <div className="flex items-center justify-between p-4">
        <div className="font-bold">Logo</div>

        {/* Mobile menu button */}
        {isMobile && (
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? '✕' : '☰'}
          </button>
        )}

        {/* Desktop navigation */}
        {!isMobile && (
          <ul className="flex gap-6">
            <li><a href="/about">About</a></li>
            <li><a href="/products">Products</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        )}
      </div>

      {/* Mobile menu */}
      {isMobile && isOpen && (
        <ul className="border-t p-4 space-y-4">
          <li><a href="/about">About</a></li>
          <li><a href="/products">Products</a></li>
          <li><a href="/contact">Contact</a></li>
        </ul>
      )}
    </nav>
  );
}
```

## Responsive Images

```tsx
// ResponsiveImage.tsx
export function ResponsiveImage({ src, alt }: { src: string; alt: string }) {
  return (
    <picture>
      {/* Mobile */}
      <source media="(max-width: 640px)" srcSet={`${src}-mobile.webp`} type="image/webp" />
      <source media="(max-width: 640px)" srcSet={`${src}-mobile.jpg`} />

      {/* Tablet */}
      <source media="(max-width: 1024px)" srcSet={`${src}-tablet.webp`} type="image/webp" />
      <source media="(max-width: 1024px)" srcSet={`${src}-tablet.jpg`} />

      {/* Desktop */}
      <source srcSet={`${src}-desktop.webp`} type="image/webp" />
      <img src={`${src}-desktop.jpg`} alt={alt} />
    </picture>
  );
}
```

## Container Queries

```css
/* Modern alternative to media queries */
@container (max-width: 400px) {
  .card {
    display: flex;
    flex-direction: column;
  }
}

@container (min-width: 401px) {
  .card {
    display: flex;
    flex-direction: row;
  }
}
```

## Testing Responsive Design

```typescript
// Card.test.tsx
import { render } from '@testing-library/react';
import { Card } from './Card';

const VIEWPORTS = [
  { width: 375, name: 'Mobile' },
  { width: 768, name: 'Tablet' },
  { width: 1024, name: 'Desktop' },
];

describe('Card Responsive Design', () => {
  VIEWPORTS.forEach(({ width, name }) => {
    it(`renders correctly on ${name} (${width}px)`, () => {
      // Mock window size
      window.innerWidth = width;
      window.dispatchEvent(new Event('resize'));

      const { container } = render(
        <Card>
          <h2>Title</h2>
          <p>Content</p>
        </Card>
      );

      expect(container).toMatchSnapshot(`card-${name}`);
    });
  });
});
```

## Touch-Friendly Sizing

```tsx
// Mobile-first component sizing
<button className="
  h-10 px-3 text-sm       /* Mobile: minimum 44px height */
  sm:h-10 sm:px-4 sm:text-base
  lg:h-12 lg:px-6 lg:text-lg
">
  Click me
</button>

<!-- Minimum touch target: 44x44px -->
<div className="min-w-11 min-h-11">
  {/* Interactive element */}
</div>
```

## Responsive Typography

```css
/* Fluid typography that scales with viewport */
@media (min-width: 320px) {
  h1 { font-size: clamp(1.5rem, 5vw, 3rem); }
  body { font-size: clamp(1rem, 2vw, 1.25rem); }
}
```

```typescript
// Or use Tailwind's fluid sizing
<h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl">
  Responsive Heading
</h1>
```

## Responsive Design Checklist

- [ ] Mobile-first: base styles work on mobile
- [ ] Test at: 375px, 768px, 1024px, 1440px+
- [ ] Touch targets ≥ 44x44px on mobile
- [ ] Font sizes readable on all sizes
- [ ] Images responsive with `srcset`
- [ ] Layout adapts to viewport
- [ ] Performance optimized for mobile
- [ ] Tested on real devices
- [ ] No horizontal scroll
- [ ] Navigation accessible on mobile
