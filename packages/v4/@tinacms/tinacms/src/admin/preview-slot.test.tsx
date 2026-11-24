import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { asResolvedConfig } from '../config';
import { TinaProvider } from '../editor';
import { NoPreview, PreviewSlot } from './preview-slot';

describe('the preview slot', () => {
  it('holds the preview frame in a slot the media picker can anchor to', async () => {
    vi.spyOn(window, 'fetch').mockImplementation(() => new Promise(() => {}));
    const { container } = render(
      <TinaProvider
        config={asResolvedConfig({
          plugins: [],
          schema: { collections: [] },
        })}
        queryClient={new QueryClient()}
      >
        <PreviewSlot
          src='http://localhost:3000/'
          connection={{}}
          expanded={false}
          moveFocus={false}
          onExpandedChange={vi.fn()}
        />
      </TinaProvider>
    );
    await waitFor(() =>
      expect(container.querySelector('[data-preview-slot]')).not.toBeNull()
    );
    const slot = container.querySelector('[data-preview-slot]');
    expect(slot).toHaveClass('relative');
    expect(slot?.querySelector('iframe')).toHaveAttribute(
      'src',
      expect.stringContaining('localhost:3000')
    );
    vi.restoreAllMocks();
  });

  it('says there is no preview, with a link to how to set one up', () => {
    render(<NoPreview />);
    expect(screen.getByRole('button', { name: /set up/i })).toBeVisible();
  });
});
