import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { Button } from './button';

describe('Button', () => {
  it('renders its children when not busy', () => {
    render(<Button>Save draft</Button>);
    expect(screen.getByText('Save draft')).toBeTruthy();
  });

  it('replaces its children with loading dots when busy', () => {
    const { container } = render(<Button busy>Save draft</Button>);
    // The label is hidden and the shared loading-dots indicator is shown, so
    // every `busy` button gets a consistent spinner without the caller wiring
    // one up.
    expect(screen.queryByText('Save draft')).toBeNull();
    expect(container.querySelector('[style*="loading-dots"]')).toBeTruthy();
  });
});
