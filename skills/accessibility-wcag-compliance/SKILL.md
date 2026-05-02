---
name: accessibility-wcag-compliance
description: Implement and verify WCAG 2.1 AA accessibility compliance. Use when building accessible interfaces, auditing components, or handling assistive technology support.
---

# Accessibility (WCAG Compliance)

## Overview

WCAG 2.1 Level AA is the standard for production web applications. It ensures your app is usable by everyone, including people with disabilities.

## When to Use

- Building new components
- Fixing accessibility issues
- Auditing existing interfaces
- Testing with assistive technologies
- Setting accessibility standards

## WCAG 2.1 Level AA Checklist

### Perceivable

#### 1.3 Adaptable - Content must be adaptable
```tsx
// ✓ Good: Semantic HTML
<h1>Page Title</h1>
<h2>Section</h2>

// ✗ Bad: Non-semantic
<div style="font-size: 2em; font-weight: bold;">Page Title</div>
<div style="font-size: 1.5em; font-weight: bold;">Section</div>

// ✓ Good: Form labels
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// ✗ Bad: Missing label
<input placeholder="Email" type="email" />
```

#### 1.4 Distinguishable - Content must be easy to see and hear
```tsx
// ✓ Good: Sufficient contrast (4.5:1 for normal text)
<p className="text-gray-900 dark:text-gray-50">High contrast text</p>

// ✓ Good: Don't rely on color alone
<div className="flex items-center gap-2">
  <span className="text-red-600">✗</span>
  <span>Error message</span>
</div>

// ✗ Bad: Insufficient contrast
<p className="text-gray-400">Low contrast text</p>

// ✗ Bad: Color only
<p className="text-red-600">This is an error</p>
```

### Operable

#### 2.1 Keyboard Accessible - All functionality must be keyboard accessible
```tsx
// ✓ Good: Native form elements
<button onClick={handleClick}>Click me</button>
<input type="text" />

// ✓ Good: Custom interactive elements with keyboard support
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  Custom button
</div>

// ✗ Bad: No keyboard access
<div onClick={handleClick}>Click me</div>
```

#### 2.4 Navigable - Help users navigate
```tsx
// ✓ Good: Visible focus indicator
<button className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
  Button
</button>

// ✓ Good: Skip link
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>

// ✓ Good: Landmarks
<main id="main-content">
  {/* Main content */}
</main>

// ✗ Bad: No focus indicator
<button>Button</button>
```

### Understandable

#### 3.1 Readable - Text must be readable and understandable
```tsx
// ✓ Good: Clear language, short sentences
<p>Enter your email address to sign in.</p>

// ✗ Bad: Complex jargon
<p>Utilize authentication credentials to commence session initialization.</p>

// ✓ Good: Define unusual words
<p>
  <abbr title="HyperText Markup Language">HTML</abbr> is used for web pages.
</p>
```

#### 3.2 Predictable - Pages must behave predictably
```tsx
// ✓ Good: Links go to new pages, buttons trigger actions
<a href="/about">About</a>
<button onClick={handleSubmit}>Submit</button>

// ✗ Bad: Links with onClick handlers
<a href="#" onClick={handleSubmit}>Submit</a>

// ✓ Good: Forms submit normally
<form onSubmit={handleSubmit}>
  <input name="email" />
  <button type="submit">Submit</button>
</form>

// ✗ Bad: Form without submit button
<form>
  <input name="email" />
  <a href="#" onClick={() => submitForm()}>Submit</a>
</form>
```

#### 3.3 Input Assistance - Help users avoid and correct mistakes
```tsx
// ✓ Good: Validation with error messages
<input
  type="email"
  aria-invalid={!!error}
  aria-describedby={error ? 'email-error' : undefined}
/>
{error && <p id="email-error" className="text-red-600">{error}</p>}

// ✓ Good: Required indicator
<label htmlFor="email">
  Email <span aria-label="required">*</span>
</label>

// ✓ Good: Helper text
<input type="password" aria-describedby="password-hint" />
<p id="password-hint">At least 8 characters</p>

// ✗ Bad: No validation or error messages
<input type="email" />
```

### Robust

#### 4.1 Compatible - Compatible with assistive technologies
```tsx
// ✓ Good: Proper ARIA attributes
<div
  role="button"
  aria-pressed={isPressed}
  aria-label="Mute audio"
  onClick={handleToggle}
/>

// ✓ Good: Error alerts
<div role="alert" className="text-red-600">
  {errorMessage}
</div>

// ✓ Good: Live regions for updates
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>

// ✗ Bad: Missing role
<div onClick={handleToggle}>Mute</div>

// ✗ Bad: Missing aria-live
<div>{dynamicContent}</div>
```

## Common ARIA Patterns

```tsx
// Alert dialog
<div
  role="alertdialog"
  aria-label="Confirm deletion"
  aria-modal="true"
>
  <p>Are you sure you want to delete this item?</p>
  <button>Cancel</button>
  <button>Delete</button>
</div>

// Toggle button
<button
  aria-pressed={isPressed}
  onClick={() => setIsPressed(!isPressed)}
>
  {isPressed ? 'On' : 'Off'}
</button>

// Disclosure widget
<button
  aria-expanded={isExpanded}
  aria-controls="panel"
  onClick={() => setIsExpanded(!isExpanded)}
>
  Show details
</button>
<div id="panel" hidden={!isExpanded}>
  {/* Hidden content */}
</div>

// Tab list
<div role="tablist">
  <button
    role="tab"
    aria-selected={selectedTab === 'tab1'}
    aria-controls="panel1"
  >
    Tab 1
  </button>
  <button
    role="tab"
    aria-selected={selectedTab === 'tab2'}
    aria-controls="panel2"
  >
    Tab 2
  </button>
</div>
<div id="panel1" role="tabpanel" hidden={selectedTab !== 'tab1'}>
  Content 1
</div>
<div id="panel2" role="tabpanel" hidden={selectedTab !== 'tab2'}>
  Content 2
</div>
```

## Testing for Accessibility

```bash
# Install testing tools
npm install --save-dev jest-axe axe-core @testing-library/react
```

```typescript
// AccessibilityTest.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Accessibility', () => {
  it('passes axe accessibility audit', async () => {
    const { container } = render(<YourComponent />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has proper landmarks', () => {
    const { getByRole } = render(<YourComponent />);
    expect(getByRole('main')).toBeInTheDocument();
    expect(getByRole('contentinfo')).toBeInTheDocument();
  });

  it('announces dynamic changes to screen readers', async () => {
    const { getByRole, getByText } = render(<YourComponent />);
    const region = getByRole('status');
    
    expect(region).toHaveAttribute('aria-live', 'polite');
    expect(getByText('Update message')).toBeInTheDocument();
  });
});
```

## Browser Testing with Assistive Technology

### Screen Reader Testing
- **macOS**: VoiceOver (Cmd+F5)
- **Windows**: NVDA (free) or JAWS
- **Firefox**: Built-in testing tools

### Testing Checklist
```
- [ ] All interactive elements are keyboard accessible (Tab, Enter, Space, Arrow keys)
- [ ] Focus is visible and logical
- [ ] All images have alt text (or are decorative with empty alt="")
- [ ] Form labels are associated with inputs
- [ ] Errors are announced to screen readers
- [ ] Dynamic content updates are announced
- [ ] Color contrast meets 4.5:1 for normal text
- [ ] Content is readable at 200% zoom
- [ ] All functionality works without mouse
```

## Tools and Resources

```
- **Axe DevTools**: Chrome/Firefox extension for auditing
- **WAVE**: Web accessibility evaluation tool
- **Lighthouse**: Built into Chrome DevTools
- **WebAIM**: Contrast checker at webaim.org/resources/contrastchecker
- **NVDA**: Free screen reader for Windows
- **VoiceOver**: Built into macOS
```

## Common Mistakes to Avoid

- [ ] Using `<div>` and `<span>` for buttons instead of `<button>`
- [ ] Skipping heading levels (h1 → h3)
- [ ] Images without alt text
- [ ] Form inputs without labels
- [ ] Color as the only indicator of state
- [ ] Low contrast text
- [ ] Removing focus indicators
- [ ] Using placeholder as label
- [ ] Infinite scroll without pause control
- [ ] Modals without focus management

## Accessibility Best Practices

- [ ] Start with semantic HTML
- [ ] Use native form elements
- [ ] Provide adequate spacing and targets (min 44px)
- [ ] Use meaningful link text ("Click here" ✗ → "Learn about dark mode" ✓)
- [ ] Announce all state changes
- [ ] Test with real assistive technology
- [ ] Include skip links
- [ ] Provide captions and transcripts for video
- [ ] Don't remove focus indicators
- [ ] Use ARIA only when necessary
