import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { RawEditorErrorBoundary } from './error-boundary';

const Throws = ({ message }: { message: string }) => {
  throw new Error(message);
};

const FAILED_IMPORT = 'Failed to fetch dynamically imported module';
const FAILED_SERIALIZE = 'Marks inside inline code are not supported';

const renderWithThrow = (message: string, onDismiss = () => {}) => {
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  render(
    <RawEditorErrorBoundary onDismiss={onDismiss}>
      <Throws message={message} />
    </RawEditorErrorBoundary>
  );
  consoleError.mockRestore();
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
    renderWithThrow(FAILED_IMPORT);
    expect(
      screen.getByText(/Couldn't open this field in raw markdown/)
    ).toBeTruthy();
  });

  it('keeps a failure to serialize the field inside the field', () => {
    renderWithThrow(FAILED_SERIALIZE);
    expect(
      screen.getByText(/Couldn't open this field in raw markdown/)
    ).toBeTruthy();
  });

  it('shows the underlying message so the editor knows what to undo', () => {
    renderWithThrow(FAILED_SERIALIZE);
    expect(screen.getByText(FAILED_SERIALIZE)).toBeTruthy();
  });

  it('offers a way back to the rich-text editor', () => {
    const onDismiss = vi.fn();
    renderWithThrow(FAILED_IMPORT, onDismiss);
    fireEvent.click(screen.getByRole('button'));
    expect(onDismiss).toHaveBeenCalledOnce();
  });
});
