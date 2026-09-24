import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ResetForm } from './reset-form';

const resetButton = () =>
  screen.getByText('Reset').closest('button') as HTMLButtonElement;

describe('ResetForm', () => {
  it('is enabled when the form has changes', () => {
    render(
      <ResetForm pristine={false} reset={vi.fn()}>
        Reset
      </ResetForm>
    );
    expect(resetButton().disabled).toBe(false);
  });

  it('is disabled while a save to a new branch runs, even with changes', () => {
    render(
      <ResetForm pristine={false} disabled reset={vi.fn()}>
        Reset
      </ResetForm>
    );
    expect(resetButton().disabled).toBe(true);
  });
});
