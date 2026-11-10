import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { FormScopeContext, type FormScope } from './context';
import { createFormViewStore } from './form-view-state';
import { useListItems } from './hooks';

const setup = (...blockedAddresses: string[]) => {
  const view = createFormViewStore();
  if (blockedAddresses.length) view.getState().block(blockedAddresses);
  // Only `view` is read by `useListItems`.
  const scope = { view } as FormScope;
  const wrapper = ({ children }: { children: ReactNode }) => (
    <FormScopeContext value={scope}>{children}</FormScopeContext>
  );
  const { result } = renderHook(() => useListItems(), { wrapper });
  const rows = () => view.getState().errorSummary.blocked.map((r) => r.address);
  return { listItems: result.current, rows };
};

describe('useListItems helpers', () => {
  it('moves the row, then applies once', () => {
    const { listItems, rows } = setup('items.2.title');
    const apply = vi.fn(() => expect(rows()).toEqual(['items.1.title']));
    listItems.move('items', 2, 1, apply);
    expect(apply).toHaveBeenCalledTimes(1);
  });

  it('shifts the row on insert and remove before applying', () => {
    const { listItems, rows } = setup('items.2.title');
    const afterInsert = vi.fn(() => expect(rows()).toEqual(['items.3.title']));
    listItems.insert('items', 0, afterInsert);
    const afterRemove = vi.fn(() => expect(rows()).toEqual(['items.2.title']));
    listItems.remove('items', 0, afterRemove);
    expect(afterInsert).toHaveBeenCalledTimes(1);
    expect(afterRemove).toHaveBeenCalledTimes(1);
  });

  it('applies once and leaves the slice alone without a blocked save', () => {
    const { listItems, rows } = setup();
    const apply = vi.fn();
    listItems.insert('items', 0, apply);
    listItems.move('items', 0, 1, apply);
    listItems.remove('items', 0, apply);
    expect(apply).toHaveBeenCalledTimes(3);
    expect(rows()).toEqual([]);
  });
});
