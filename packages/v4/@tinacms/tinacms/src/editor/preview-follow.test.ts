import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFollower } from './preview-follow';

const setup = () => {
  const open = vi.fn();
  const nothingToEdit = vi.fn();
  const follower = createFollower({ open, nothingToEdit });
  const showing = { showing: true, onPage: false };
  return { open, nothingToEdit, follower, showing };
};

const NAV = { path: 'content/global/site.json', shared: true };
const A = { path: 'content/posts/a.mdx' };
const B = { path: 'content/posts/b.mdx' };

describe('following the page', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('never moves the form during the first visit, however late the main document arrives', () => {
    const { open, nothingToEdit, follower, showing } = setup();
    follower.update([NAV], '/a', showing);
    vi.advanceTimersByTime(2000);
    follower.update([NAV, A], '/a', showing);
    expect(open).not.toHaveBeenCalled();
    expect(nothingToEdit).not.toHaveBeenCalled();
  });

  it('opens the first main document of a later visit, whenever it arrives', () => {
    const { open, follower, showing } = setup();
    follower.update([NAV, A], '/a', showing);
    follower.update([NAV], '/b', showing);
    vi.advanceTimersByTime(100);
    follower.update([NAV, B], '/b', showing);
    expect(open).toHaveBeenCalledExactlyOnceWith(B.path);
  });

  it('shows Nothing to edit after 300 ms with no main document, and still opens one that arrives later', () => {
    const { open, nothingToEdit, follower, showing } = setup();
    follower.update([A], '/a', showing);
    follower.update([NAV], '/blog', showing);
    vi.advanceTimersByTime(299);
    expect(nothingToEdit).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(nothingToEdit).toHaveBeenCalledOnce();
    follower.update([NAV, B], '/blog', showing);
    expect(open).toHaveBeenCalledExactlyOnceWith(B.path);
  });

  it('does not show Nothing to edit when a main document follows the nav within the window', () => {
    const { open, nothingToEdit, follower, showing } = setup();
    follower.update([A], '/a', showing);
    follower.update([NAV], '/b', showing);
    vi.advanceTimersByTime(50);
    follower.update([NAV, B], '/b', showing);
    vi.advanceTimersByTime(1000);
    expect(nothingToEdit).not.toHaveBeenCalled();
    expect(open).toHaveBeenCalledExactlyOnceWith(B.path);
  });

  it('a reload of the same url neither moves the form nor shows Nothing to edit', () => {
    const { open, nothingToEdit, follower, showing } = setup();
    follower.update([A], '/a', showing);
    follower.update([NAV], '/b', showing);
    follower.update([NAV, B], '/b', showing);
    open.mockClear();
    follower.update([NAV], '/b', showing);
    vi.advanceTimersByTime(1000);
    follower.update([NAV, B], '/b', showing);
    expect(open).not.toHaveBeenCalled();
    expect(nothingToEdit).not.toHaveBeenCalled();
  });

  it('opens a different main document that appears in the same visit', () => {
    const { open, follower, showing } = setup();
    follower.update([A], '/a', showing);
    follower.update([NAV, A], '/b', showing);
    follower.update([NAV, B], '/b', showing);
    expect(open).toHaveBeenCalledWith(B.path);
  });

  it('keeps the first non-shared document as the main one while it stays declared', () => {
    const { follower, showing } = setup();
    follower.update([A, B], '/a', showing);
    follower.update([B, A], '/a', showing);
    expect(follower.main()).toBe(A.path);
  });

  it('treats a path declared both shared and not as not shared', () => {
    const { follower, showing } = setup();
    follower.update([{ path: A.path, shared: true }, A], '/a', showing);
    expect(follower.declared()).toEqual([{ path: A.path }]);
  });

  it('opens a declared main document at once on Nothing to edit, even in the baseline visit', () => {
    const { open, follower } = setup();
    follower.update([NAV, A], '/a', { showing: true, onPage: true });
    expect(open).toHaveBeenCalledExactlyOnceWith(A.path);
  });

  it('never navigates while hidden, and takes the visit on show as the baseline', () => {
    const { open, nothingToEdit, follower, showing } = setup();
    follower.update([A], '/a', showing);
    follower.update([NAV], '/b', showing);
    follower.setShowing(false);
    follower.update([NAV, B], '/c', { showing: false, onPage: false });
    vi.advanceTimersByTime(1000);
    follower.setShowing(true);
    follower.update([NAV, B], '/c', showing);
    expect(open).not.toHaveBeenCalled();
    expect(nothingToEdit).not.toHaveBeenCalled();
  });

  it('a declaration without a url continues the current visit', () => {
    const { open, follower, showing } = setup();
    follower.update([A], '/a', showing);
    follower.update([NAV], undefined, showing);
    follower.update([NAV, B], undefined, showing);
    expect(open).not.toHaveBeenCalled();
  });
});
