---
name: component-library-management
description: Build reusable component libraries that scale with your product. Use when creating shared components, managing component versioning, or maintaining a component ecosystem.
---

# Component Library Management

## Overview

A well-maintained component library accelerates development, ensures consistency, and reduces duplicate code. It's the foundation of a scalable UI.

## When to Use

- Building new shared components
- Maintaining and updating existing components
- Documenting component APIs
- Managing component variants
- Releasing component library updates

## Component Maturity Levels

### Level 1: Prototype (Internal Use Only)
- Single implementation
- Basic documentation
- No versioning
- Breaking changes allowed

### Level 2: Stable (Team Use)
- Complete API documentation
- Semantic versioning
- Multiple variants
- Accessibility compliance

### Level 3: Published (External/Public)
- Published to npm or private registry
- Comprehensive testing
- Changelog maintained
- Backward compatibility guaranteed
- Breaking changes documented

## Component Registry Structure

```typescript
// components/index.ts - Public API
export { Button } from './Button';
export type { ButtonProps } from './Button/types';

export { Card } from './Card';
export type { CardProps } from './Card/types';

export { Input } from './Input';
export type { InputProps } from './Input/types';

// Utilities
export { useMediaQuery } from './hooks/useMediaQuery';
export { cn } from './utils/classnames';

// Types and Constants
export type { Variant, Size } from './types/common';
export { BREAKPOINTS } from './constants/breakpoints';
```

## Component Template

```typescript
// components/Button/Button.tsx
import React from 'react';
import { ButtonProps } from './types';
import { buttonVariants } from './variants';
import { cn } from '../../utils/classnames';

/**
 * Button component for primary user actions.
 *
 * @example
 * <Button variant="primary" onClick={handleClick}>Save</Button>
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, disabled, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          buttonVariants({ variant, size }),
          isLoading && 'opacity-50 pointer-events-none',
          disabled && 'disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? <Spinner size={size} /> : children}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

```typescript
// components/Button/types.ts
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
}
```

```typescript
// components/Button/variants.ts
import { cva, type VariantProps } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex items-center justify-center rounded font-medium transition-colors',
  {
    variants: {
      variant: {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400',
        tertiary: 'bg-transparent text-blue-600 hover:bg-blue-50 active:bg-blue-100',
        destructive: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-6 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
```

## Testing Strategy

```typescript
// components/Button/Button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('applies correct variant styles', () => {
    render(<Button variant="secondary">Test</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-gray-200');
  });

  it('is accessible with keyboard', async () => {
    render(<Button>Click</Button>);
    const button = screen.getByRole('button');
    button.focus();
    expect(button).toHaveFocus();
  });

  it('shows loading state', () => {
    render(<Button isLoading>Save</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

## Documentation with Storybook

```typescript
// components/Button/Button.stories.tsx
import { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'tertiary', 'destructive'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
};

export const Loading: Story = {
  args: {
    children: 'Save Changes',
    isLoading: true,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="tertiary">Tertiary</Button>
      <Button variant="destructive">Delete</Button>
    </div>
  ),
};
```

## Version Management

### CHANGELOG Format

```markdown
# 2.0.0 - 2025-01-15

## Breaking Changes
- Removed `danger` variant, use `destructive` instead
- Changed `Loading` prop to `isLoading`

## Features
- Added `fullWidth` prop
- New `tertiary` variant

## Fixes
- Fixed focus ring not visible on dark backgrounds
- Improved disabled state contrast

## Migration Guide
```

## Release Checklist

- [ ] Bump version in package.json
- [ ] Update CHANGELOG
- [ ] Run all tests (`npm test`)
- [ ] Check visual regression tests
- [ ] Build and check bundle size
- [ ] Create git tag
- [ ] Publish to registry
- [ ] Update documentation site
- [ ] Announce breaking changes (if any)
