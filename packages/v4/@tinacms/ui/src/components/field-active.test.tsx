import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Input } from './input';
import { Select, SelectTrigger, SelectValue } from './select';
import { Textarea } from './textarea';

const classesOf = (element: HTMLElement) => element.className.split(/\s+/);

const sharesFocusLook = (element: HTMLElement) => {
  const classes = classesOf(element);
  expect(classes).toContain('data-active:border-ring');
  expect(classes).toContain('data-active:shadow-focus-field');
};

const keepsOverrides = (element: HTMLElement) => {
  const classes = classesOf(element);
  expect(classes).toContain('aria-invalid:data-active:border-destructive');
  expect(classes).toContain('disabled:data-active:shadow-none');
  expect(classes).toContain('data-readonly:data-active:shadow-none');
};

describe('data-active field look', () => {
  it('Input takes the focus look and keeps the error, disabled and read-only looks', () => {
    render(<Input aria-label='Title' data-active='' />);
    const input = screen.getByLabelText('Title');
    expect(input).toHaveAttribute('data-active');
    sharesFocusLook(input);
    keepsOverrides(input);
  });

  it('Textarea takes the same look', () => {
    render(<Textarea aria-label='Body' data-active='' />);
    const box = screen.getByLabelText('Body');
    sharesFocusLook(box);
    keepsOverrides(box);
  });

  it('Select trigger takes the same look', () => {
    render(
      <Select items={[{ value: 'a', label: 'A' }]} value='a'>
        <SelectTrigger aria-label='Kind' data-active=''>
          <SelectValue />
        </SelectTrigger>
      </Select>
    );
    const trigger = screen.getByLabelText('Kind');
    expect(trigger).toHaveAttribute('data-active');
    sharesFocusLook(trigger);
    keepsOverrides(trigger);
  });
});
