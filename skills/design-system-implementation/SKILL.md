---
name: design-system-implementation
description: Build and maintain scalable design systems for enterprise applications. Use when creating design system foundations, establishing component standards, or documenting design principles.
---

# Design System Implementation

## Overview

A design system is the single source of truth for UI standards, components, and patterns. It enables teams to build consistently, scale efficiently, and maintain quality across products.

## When to Use

- Establishing or updating a design system
- Creating design system documentation
- Building foundations for consistency
- Setting up component registration and variants
- Defining design tokens and theming strategy

## Core Structure

### Design System Anatomy

```
design-system/
  ├── tokens/
  │   ├── colors.ts
  │   ├── spacing.ts
  │   ├── typography.ts
  │   ├── shadows.ts
  │   └── breakpoints.ts
  ├── components/
  │   ├── Button/
  │   ├── Card/
  │   ├── Input/
  │   └── ... (all base components)
  ├── patterns/
  │   ├── forms.md
  │   ├── tables.md
  │   ├── modals.md
  │   └── ... (usage patterns)
  ├── guidelines/
  │   ├── accessibility.md
  │   ├── responsive-design.md
  │   ├── color-usage.md
  │   └── typography-hierarchy.md
  └── README.md
```

## Design Tokens

Define tokens for all visual properties:

```typescript
// tokens/colors.ts
export const colors = {
  // Neutral
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  // Semantic
  primary: 'var(--gray-700)',
  secondary: 'var(--gray-500)',
  surface: 'var(--gray-50)',
  border: 'var(--gray-200)',
  text: {
    primary: 'var(--gray-900)',
    secondary: 'var(--gray-600)',
    tertiary: 'var(--gray-500)',
    inverted: 'var(--gray-50)',
  },
};

export const spacing = {
  xs: '0.25rem',  // 4px
  sm: '0.5rem',   // 8px
  md: '1rem',     // 16px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
  '2xl': '3rem',  // 48px
};

export const typography = {
  h1: {
    fontSize: '2rem',
    lineHeight: 1.2,
    fontWeight: 700,
  },
  h2: {
    fontSize: '1.5rem',
    lineHeight: 1.25,
    fontWeight: 700,
  },
  body: {
    fontSize: '1rem',
    lineHeight: 1.5,
    fontWeight: 400,
  },
  small: {
    fontSize: '0.875rem',
    lineHeight: 1.43,
    fontWeight: 400,
  },
};
```

## Component Definition Standard

Every component should include:

```markdown
# Button Component

## Purpose
Primary interactive element for user actions.

## Variants
- **Primary**: High-emphasis actions
- **Secondary**: Lower-emphasis actions
- **Tertiary**: Ghost/link style

## Sizes
- **sm**: 32px height (compact)
- **md**: 40px height (default)
- **lg**: 48px height (prominent)

## States
- Default
- Hover
- Active
- Disabled
- Loading

## Accessibility
- Keyboard focusable
- Supports aria-label
- Color contrast ≥ 4.5:1
- Focus indicator visible

## Usage

### Good
\`\`\`tsx
<Button variant="primary" size="md">
  Save Changes
</Button>
\`\`\`

### Avoid
\`\`\`tsx
<button className="bg-blue-500 px-4 py-2 rounded">Save</button>
\`\`\`
```

## Documentation Standards

### README
- Purpose and philosophy
- Quick start guide
- Design token reference
- Component index
- Accessibility standards

### Component Pages
- Use cases
- Variants gallery
- Code examples
- Do's and don'ts
- Accessibility checklist

### Pattern Pages
- When to use
- Structure and anatomy
- Best practices
- Common mistakes

## Consistency Checks

- [ ] All colors use tokens, not hardcoded hex
- [ ] All spacing uses the spacing scale
- [ ] Typography follows the hierarchy
- [ ] All components have accessible variants
- [ ] Components are documented
- [ ] Patterns are documented
- [ ] Mobile-first responsive included
- [ ] Dark mode considered for all components

## Versioning

Use semantic versioning for the design system:
- **Major**: Breaking changes (component API changes)
- **Minor**: New components or features
- **Patch**: Bug fixes or documentation updates

## Enforcement

- TypeScript for token definitions
- Storybook for visual regression testing
- Linting for token usage
- Code review for new additions
- Regular audits for consistency
