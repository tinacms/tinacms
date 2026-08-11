import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { RawEditorErrorBoundary } from './error-boundary';

const Boom = () => {
  throw new Error('Failed to fetch dynamically imported module');
};

describe('RawEditorErrorBoundary', () => {
  it('renders its children when nothing throws', () => {
    render(
      <RawEditorErrorBoundary onDismiss={() => {}}>
        <div>raw editor</div>
      </RawEditorErrorBoundary>
    );
    expect(screen.getByText('raw editor')).toBeTruthy();
  });

  it('keeps a failed lazy import inside the field', () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    render(
      <RawEditorErrorBoundary onDismiss={() => {}}>
        <Boom />
      </RawEditorErrorBoundary>
    );
    expect(screen.getByText(/couldn't be loaded/)).toBeTruthy();
    consoleError.mockRestore();
  });

  it('offers a way back to the rich-text editor', () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const onDismiss = vi.fn();
    render(
      <RawEditorErrorBoundary onDismiss={onDismiss}>
        <Boom />
      </RawEditorErrorBoundary>
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onDismiss).toHaveBeenCalledOnce();
    consoleError.mockRestore();
  });
});
