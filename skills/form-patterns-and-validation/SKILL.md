---
name: form-patterns-and-validation
description: Implement robust form patterns with validation, error handling, and accessibility. Use when building forms, implementing validation, or handling form state.
---

# Form Patterns and Validation

## Overview

Forms are the primary way users provide data. Production-quality forms require proper validation, accessible error messages, and clear feedback.

## When to Use

- Building new forms
- Adding validation
- Handling form submission
- Managing complex form state
- Ensuring form accessibility

## Form State Management Pattern

```typescript
// useForm.ts
import { useState, useCallback } from 'react';

export interface FormState {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
}

export interface FormConfig {
  initialValues: Record<string, any>;
  onSubmit: (values: Record<string, any>) => Promise<void>;
  validate?: (values: Record<string, any>) => Record<string, string>;
}

export function useForm({ initialValues, onSubmit, validate }: FormConfig) {
  const [state, setState] = useState<FormState>({
    values: initialValues,
    errors: {},
    touched: {},
    isSubmitting: false,
  });

  const setFieldValue = useCallback(
    (name: string, value: any) => {
      setState(prev => ({
        ...prev,
        values: { ...prev.values, [name]: value },
      }));
    },
    []
  );

  const setFieldTouched = useCallback((name: string, isTouched = true) => {
    setState(prev => ({
      ...prev,
      touched: { ...prev.touched, [name]: isTouched },
    }));
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFieldValue(name, type === 'checkbox' ? checked : value);
  }, [setFieldValue]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Validate
      const errors = validate?.(state.values) ?? {};
      setState(prev => ({ ...prev, errors }));

      if (Object.keys(errors).length > 0) return;

      // Submit
      setState(prev => ({ ...prev, isSubmitting: true }));
      try {
        await onSubmit(state.values);
      } catch (error) {
        // Handle error
        console.error(error);
      } finally {
        setState(prev => ({ ...prev, isSubmitting: false }));
      }
    },
    [state.values, validate, onSubmit]
  );

  return {
    ...state,
    setFieldValue,
    setFieldTouched,
    handleChange,
    handleSubmit,
    reset: () => setState({
      values: initialValues,
      errors: {},
      touched: {},
      isSubmitting: false,
    }),
  };
}
```

## Form Component Pattern

```typescript
// LoginForm.tsx
import { useForm } from './useForm';
import { validateLoginForm } from './validation';
import { Input } from './components/Input';
import { Button } from './components/Button';

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const form = useForm({
    initialValues: { email: '', password: '' },
    validate: validateLoginForm,
    onSubmit: async (values) => {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error('Login failed');
      onSuccess?.();
    },
  });

  return (
    <form onSubmit={form.handleSubmit} noValidate>
      <fieldset disabled={form.isSubmitting}>
        <Input
          label="Email"
          type="email"
          name="email"
          value={form.values.email}
          onChange={form.handleChange}
          onBlur={() => form.setFieldTouched('email')}
          error={form.touched.email ? form.errors.email : undefined}
          aria-invalid={!!form.errors.email}
          aria-describedby={form.errors.email ? 'email-error' : undefined}
        />
        {form.errors.email && form.touched.email && (
          <p id="email-error" className="text-red-600 text-sm mt-1">
            {form.errors.email}
          </p>
        )}

        <Input
          label="Password"
          type="password"
          name="password"
          value={form.values.password}
          onChange={form.handleChange}
          onBlur={() => form.setFieldTouched('password')}
          error={form.touched.password ? form.errors.password : undefined}
          aria-invalid={!!form.errors.password}
          aria-describedby={form.errors.password ? 'password-error' : undefined}
        />
        {form.errors.password && form.touched.password && (
          <p id="password-error" className="text-red-600 text-sm mt-1">
            {form.errors.password}
          </p>
        )}

        <Button
          type="submit"
          isLoading={form.isSubmitting}
          fullWidth
        >
          Sign In
        </Button>
      </fieldset>
    </form>
  );
}
```

## Validation Patterns

```typescript
// validation.ts
export interface ValidationRule {
  validate: (value: any) => boolean;
  message: string;
}

export const rules = {
  required: (fieldName: string): ValidationRule => ({
    validate: (value) => value?.trim?.() ?? value,
    message: `${fieldName} is required`,
  }),
  email: (): ValidationRule => ({
    validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: 'Invalid email address',
  }),
  minLength: (length: number): ValidationRule => ({
    validate: (value) => value?.length >= length,
    message: `Minimum ${length} characters required`,
  }),
  maxLength: (length: number): ValidationRule => ({
    validate: (value) => value?.length <= length,
    message: `Maximum ${length} characters allowed`,
  }),
  pattern: (pattern: RegExp, message: string): ValidationRule => ({
    validate: (value) => pattern.test(value),
    message,
  }),
};

export function validateField(value: any, fieldRules: ValidationRule[]): string | undefined {
  for (const rule of fieldRules) {
    if (!rule.validate(value)) {
      return rule.message;
    }
  }
}

export function validateLoginForm(values: { email: string; password: string }) {
  const errors: Record<string, string> = {};

  const emailError = validateField(values.email, [
    rules.required('Email'),
    rules.email(),
  ]);
  if (emailError) errors.email = emailError;

  const passwordError = validateField(values.password, [
    rules.required('Password'),
    rules.minLength(8),
  ]);
  if (passwordError) errors.password = passwordError;

  return errors;
}
```

## Accessible Input Component

```typescript
// Input.tsx
import React from 'react';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random()}`;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className="space-y-1">
        <label htmlFor={inputId} className="block text-sm font-medium">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-3 py-2 border rounded-md
            focus:outline-none focus:ring-2 focus:ring-blue-500
            ${error ? 'border-red-500' : 'border-gray-300'}
          `}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          {...props}
        />
        {error && (
          <p id={errorId} className="text-red-600 text-sm" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="text-gray-500 text-sm">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
```

## Multi-Step Form Pattern

```typescript
// MultiStepForm.tsx
import { useState } from 'react';
import { useForm } from './useForm';

export function MultiStepForm() {
  const [step, setStep] = useState(1);
  const form = useForm({
    initialValues: {
      email: '',
      password: '',
      name: '',
      avatar: '',
    },
    onSubmit: async (values) => {
      // Final submission
    },
  });

  const goToNextStep = () => {
    // Validate current step
    setStep(step + 1);
  };

  return (
    <form onSubmit={step === 3 ? form.handleSubmit : (e) => {
      e.preventDefault();
      goToNextStep();
    }}>
      <div role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={3}>
        Step {step} of 3
      </div>

      {step === 1 && (
        <>
          {/* Email and Password fields */}
        </>
      )}
      {step === 2 && (
        <>
          {/* Name and Avatar fields */}
        </>
      )}
      {step === 3 && (
        <>
          {/* Review and Submit */}
        </>
      )}

      <div className="flex gap-2">
        {step > 1 && <Button onClick={() => setStep(step - 1)}>Back</Button>}
        <Button type="submit">
          {step === 3 ? 'Submit' : 'Next'}
        </Button>
      </div>
    </form>
  );
}
```

## Form Best Practices

- [ ] Label all inputs with `<label>` elements
- [ ] Show validation errors near the problematic field
- [ ] Use `aria-invalid` and `aria-describedby`
- [ ] Disable submit button during submission
- [ ] Show loading state during submission
- [ ] Preserve form data on navigation (if appropriate)
- [ ] Validate on blur for better UX
- [ ] Show helper text for complex fields
- [ ] Clear errors when user starts typing
- [ ] Test form keyboard navigation
