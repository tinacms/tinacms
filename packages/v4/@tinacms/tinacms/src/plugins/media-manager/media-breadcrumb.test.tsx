import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MediaBreadcrumb } from './media-breadcrumb';

describe('MediaBreadcrumb', () => {
  it('shows only the root for the media root', () => {
    render(<MediaBreadcrumb folder='' onOpen={() => {}} />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByText('Media')).toHaveAttribute('aria-current', 'page');
  });

  it('goes to the parent folder with the back arrow', async () => {
    const onOpen = vi.fn();
    const user = userEvent.setup();
    render(<MediaBreadcrumb folder='posts/2026' onOpen={onOpen} />);
    await user.click(screen.getByRole('button', { name: 'Parent folder' }));
    expect(onOpen).toHaveBeenCalledWith('posts');
  });

  it('opens each ancestor folder, and marks the current one', async () => {
    const onOpen = vi.fn();
    const user = userEvent.setup();
    render(<MediaBreadcrumb folder='posts/2026' onOpen={onOpen} />);
    expect(screen.getByText('2026')).toHaveAttribute('aria-current', 'page');
    await user.click(screen.getByRole('button', { name: 'posts' }));
    await user.click(screen.getByRole('button', { name: 'Media' }));
    expect(onOpen.mock.calls).toEqual([['posts'], ['']]);
  });
});
