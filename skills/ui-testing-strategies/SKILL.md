---
name: ui-testing-strategies
description: Implement comprehensive testing strategies for UI components. Use when setting up tests, testing interactions, or ensuring component reliability.
---

# UI Testing Strategies

## Overview

UI testing requires multiple levels: unit tests for components, integration tests for features, and visual regression tests for appearance consistency.

## When to Use

- Writing component tests
- Testing user interactions
- Ensuring accessibility compliance
- Setting up visual regression testing
- Creating test utilities

## Testing Pyramid

```
        E2E Tests (Selenium, Playwright)
            /\
           /  \
          /    \
       Integration Tests (Testing Library)
        /\        /\
       /  \      /  \
      /    \    /    \
   Unit Tests (Vitest, Jest)
```

## Unit Testing with Vitest/Jest

```typescript
// Button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button Component', () => {
  // Rendering tests
  describe('Rendering', () => {
    it('renders with children text', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('applies variant class names', () => {
      const { rerender } = render(<Button variant="secondary">Test</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-gray-200');

      rerender(<Button variant="primary">Test</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-blue-600');
    });
  });

  // Interaction tests
  describe('Interactions', () => {
    it('calls onClick handler on click', async () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click</Button>);
      
      await userEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledOnce();
    });

    it('does not call onClick when disabled', async () => {
      const handleClick = vi.fn();
      render(<Button disabled onClick={handleClick}>Click</Button>);
      
      await userEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  // State tests
  describe('States', () => {
    it('shows loading state', () => {
      render(<Button isLoading>Save</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
      expect(screen.getByLabelText('Loading')).toBeInTheDocument();
    });

    it('is disabled when disabled prop is true', () => {
      render(<Button disabled>Click</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  // Accessibility tests
  describe('Accessibility', () => {
    it('is keyboard accessible', async () => {
      render(<Button>Click</Button>);
      const button = screen.getByRole('button');
      
      button.focus();
      expect(button).toHaveFocus();
      
      await userEvent.keyboard('{Enter}');
      expect(button).toHaveFocus();
    });

    it('has accessible label for icon-only button', () => {
      render(<Button aria-label="Close">✕</Button>);
      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
    });

    it('passes axe accessibility checks', async () => {
      const { container } = render(<Button>Click me</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
```

## Integration Testing

```typescript
// TaskForm.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskForm } from './TaskForm';

describe('TaskForm Integration', () => {
  it('submits form with valid data', async () => {
    const handleSubmit = vi.fn();
    render(<TaskForm onSubmit={handleSubmit} />);

    await userEvent.type(screen.getByLabelText('Task Name'), 'New task');
    await userEvent.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({ name: 'New task' });
    });
  });

  it('shows validation errors', async () => {
    render(<TaskForm onSubmit={vi.fn()} />);
    
    await userEvent.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      expect(screen.getByText(/task name is required/i)).toBeInTheDocument();
    });
  });

  it('disables submit button while loading', async () => {
    render(
      <TaskForm 
        onSubmit={async () => new Promise(resolve => setTimeout(resolve, 100))}
      />
    );

    await userEvent.type(screen.getByLabelText('Task Name'), 'New task');
    await userEvent.click(screen.getByRole('button', { name: /create/i }));

    expect(screen.getByRole('button', { name: /create/i })).toBeDisabled();
  });
});
```

## Visual Regression Testing

```typescript
// Button.visual.test.tsx
import { render } from '@testing-library/react';
import { Button } from './Button';

describe('Button Visual Regression', () => {
  it('matches primary variant snapshot', () => {
    const { container } = render(<Button variant="primary">Primary</Button>);
    expect(container).toMatchSnapshot();
  });

  it('matches all button variants', () => {
    const variants = ['primary', 'secondary', 'tertiary', 'destructive'];
    variants.forEach(variant => {
      const { container } = render(
        <Button variant={variant as any}>{variant}</Button>
      );
      expect(container).toMatchSnapshot(`button-${variant}`);
    });
  });

  it('matches state combinations', () => {
    const states = [
      { disabled: true },
      { isLoading: true },
      { size: 'lg', variant: 'secondary' },
    ];

    states.forEach((props, index) => {
      const { container } = render(<Button {...props}>Test</Button>);
      expect(container).toMatchSnapshot(`button-state-${index}`);
    });
  });
});
```

## Accessibility Testing Checklist

```typescript
// useAccessibilityChecks.ts
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

export async function checkAccessibility(container: HTMLElement) {
  const results = await axe(container);
  expect(results).toHaveNoViolations();
  return results;
}

// Usage in test
it('passes accessibility checks', async () => {
  const { container } = render(<Button>Click me</Button>);
  await checkAccessibility(container);
});
```

## Test Utilities

```typescript
// test-utils.tsx
import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from './ThemeContext';

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) =>
  render(ui, {
    wrapper: ({ children }) => (
      <ThemeProvider>{children}</ThemeProvider>
    ),
    ...options,
  });

export * from '@testing-library/react';
export { customRender as render };
```

## Coverage Targets

- **Statements**: ≥ 80%
- **Branches**: ≥ 75%
- **Functions**: ≥ 80%
- **Lines**: ≥ 80%
- **Critical paths**: 100%

## Testing Best Practices

- [ ] Test user behavior, not implementation
- [ ] Use semantic queries (getByRole, getByLabelText)
- [ ] Avoid testing internal state
- [ ] Test error boundaries
- [ ] Test loading and empty states
- [ ] Verify accessibility with axe-core
- [ ] Use realistic test data
- [ ] Clean up after tests
- [ ] Mock external APIs, not components
- [ ] Use data-testid sparingly (as last resort)
