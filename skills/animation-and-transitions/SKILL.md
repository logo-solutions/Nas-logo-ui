---
name: animation-and-transitions
description: Implement smooth animations and transitions that enhance UX without creating bloat. Use when adding motion, timing interactions, or improving perceived performance.
---

# Animation and Transitions

## Overview

Purposeful animation improves perceived performance and guides user attention. Poor animation is distracting and slow.

## When to Use

- Transitioning between states
- Providing feedback on interactions
- Guiding user attention
- Improving perceived performance
- Creating delightful interactions

## Transition Timing Principles

**Duration by distance:**
```
Very short (100-150ms)  → Color changes, focus states, opacity
Short (200-300ms)       → Small movements, tooltips
Medium (300-500ms)      → Page transitions, modal opens
Long (500-800ms)        → Complex animations
```

**Easing curves:**
```
ease-in-out  → Most interactions (starts slow, ends slow)
ease-out     → Appearing elements (fast start, slow end)
ease-in      → Disappearing elements (slow start, fast end)
linear       → Continuous motion (loading spinners)
```

## Tailwind Transitions

```html
<!-- Basic transitions -->
<button class="
  bg-blue-600
  hover:bg-blue-700
  transition-colors
  duration-200
">
  Hover me
</button>

<!-- Multiple properties -->
<div class="
  opacity-0 hover:opacity-100
  scale-95 hover:scale-100
  transition-all
  duration-300
  ease-out
">
  Tooltip
</div>

<!-- Custom timing -->
<div class="
  transition-transform
  duration-500
  ease-in-out
">
  Complex animation
</div>
```

## CSS Animations

```css
/* styles/animations.css */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-slide-in {
  animation: slideIn 0.3s ease-out;
}

.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}
```

## React Transition Component

```typescript
// useTransition.ts
import { useState, useEffect } from 'react';

interface TransitionState {
  isEntering: boolean;
  isEntered: boolean;
  isExiting: boolean;
  isExited: boolean;
}

export function useTransition(isVisible: boolean, duration = 300): TransitionState {
  const [state, setState] = useState<TransitionState>({
    isEntering: isVisible,
    isEntered: isVisible,
    isExiting: false,
    isExited: !isVisible,
  });

  useEffect(() => {
    if (isVisible) {
      setState({
        isEntering: true,
        isEntered: false,
        isExiting: false,
        isExited: false,
      });

      const timer = setTimeout(() => {
        setState(prev => ({
          ...prev,
          isEntering: false,
          isEntered: true,
        }));
      }, 50);

      return () => clearTimeout(timer);
    } else {
      setState(prev => ({
        ...prev,
        isExiting: true,
        isEntered: false,
      }));

      const timer = setTimeout(() => {
        setState(prev => ({
          ...prev,
          isExiting: false,
          isExited: true,
          isEntering: false,
        }));
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration]);

  return state;
}
```

## Modal with Animation

```typescript
// Modal.tsx
import { useTransition } from './hooks/useTransition';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const transition = useTransition(isOpen, 300);

  if (transition.isExited) return null;

  return (
    <div
      className={`
        fixed inset-0 z-50
        flex items-center justify-center
        transition-opacity duration-300
        ${transition.isEntered ? 'opacity-100' : 'opacity-0'}
      `}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Modal */}
      <div
        className={`
          relative bg-white rounded-lg shadow-lg
          w-full max-w-md mx-4
          transition-all duration-300
          ${transition.isEntered
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-95'
          }
        `}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
```

## List Item Stagger Animation

```typescript
// AnimatedList.tsx
import { useTransition } from './hooks/useTransition';

interface AnimatedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  staggerDelay?: number;
}

export function AnimatedList<T>({
  items,
  renderItem,
  staggerDelay = 50,
}: AnimatedListProps<T>) {
  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li
          key={index}
          className="
            opacity-0 animate-slide-in
            [animation-fill-mode:forwards]
          "
          style={{
            animationDelay: `${index * staggerDelay}ms`,
          }}
        >
          {renderItem(item, index)}
        </li>
      ))}
    </ul>
  );
}
```

## Skeleton Loading with Animation

```typescript
// Skeleton.tsx
export function Skeleton() {
  return (
    <div className="space-y-3">
      <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
    </div>
  );
}

// Custom pulse animation
<style>
  @keyframes customPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  .animate-custom-pulse {
    animation: customPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
</style>
```

## Interaction Animation Example

```typescript
// Button with ripple effect
export function RippleButton() {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const addRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples(prev => [...prev, { x, y, id }]);

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 600);
  };

  return (
    <button
      onClick={addRipple}
      className="relative overflow-hidden px-4 py-2 bg-blue-600 text-white rounded"
    >
      Click me
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="
            absolute rounded-full bg-white/40
            animate-ping
          "
          style={{
            left: ripple.x,
            top: ripple.y,
            width: '20px',
            height: '20px',
            pointerEvents: 'none',
          }}
        />
      ))}
    </button>
  );
}
```

## Animation Performance Tips

- [ ] Use `transform` and `opacity` for performance
- [ ] Avoid animating `width`, `height`, `position` (causes layout shifts)
- [ ] Use `will-change` sparingly
- [ ] Test with `prefers-reduced-motion`
- [ ] Keep animations under 500ms for UI feedback
- [ ] Use CSS animations for continuous motion (not JS)
- [ ] Debounce animation triggers
- [ ] Profile animations with DevTools
- [ ] Don't animate on scroll (unless necessary)

## Respecting Accessibility

```typescript
// Respect user's motion preferences
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const duration = prefersReducedMotion ? 0 : 300;
const animationName = prefersReducedMotion ? 'none' : 'slideIn';
```

```css
/* In CSS */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```
