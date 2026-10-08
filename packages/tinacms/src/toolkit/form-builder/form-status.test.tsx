import { cleanup, render, screen } from '@testing-library/react';
import * as React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { FormStatus } from './form-builder';

afterEach(cleanup);

describe('FormStatus', () => {
  it('names the saved state', () => {
    render(<FormStatus pristine={true} />);

    expect(
      screen.getByRole('img', { name: 'No unsaved changes' })
    ).toBeTruthy();
  });

  it('names the unsaved state', () => {
    render(<FormStatus pristine={false} />);

    expect(screen.getByRole('img', { name: 'Unsaved changes' })).toBeTruthy();
  });

  // The colour alone does not carry for everyone who can see it, so the dot is titled as well.
  it('titles the dot so hovering it answers the question too', () => {
    const { container } = render(<FormStatus pristine={false} />);

    expect(container.querySelector('title')?.textContent).toBe(
      'Unsaved changes'
    );
  });
});
