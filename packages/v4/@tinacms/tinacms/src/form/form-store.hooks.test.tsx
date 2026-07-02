import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { toFieldAddress } from '../core/field/address';
import {
  toFormId,
  useFormStatus,
  useFormStore,
  useIsFieldDirty,
  useIsFormDirty,
} from './form-store';

// The exported hooks are the store's public surface (re-exported from editor/index.ts).
// The getState() tests prove the reducer logic; these prove the Zustand selector actually
// subscribes and re-renders a consumer when the form's status changes.
const title = toFieldAddress('title');
const postA = toFormId('posts/a.mdx');

beforeEach(() => {
  useFormStore.setState({ forms: {} });
});

describe('form-store hooks re-render on status changes', () => {
  it('useFormStatus tracks pristine -> dirty -> clean', () => {
    const { result } = renderHook(() => useFormStatus(postA));
    expect(result.current).toBe('pristine');

    act(() =>
      useFormStore.getState().registerForm(postA, { [title]: 'Hello' })
    );
    expect(result.current).toBe('pristine');

    act(() => useFormStore.getState().setFieldValue(postA, title, 'Edited'));
    expect(result.current).toBe('dirty');

    act(() => useFormStore.getState().setFieldValue(postA, title, 'Hello'));
    expect(result.current).toBe('clean');
  });

  it('useIsFormDirty and useIsFieldDirty subscribe to their form', () => {
    act(() =>
      useFormStore.getState().registerForm(postA, { [title]: 'Hello' })
    );
    const formDirty = renderHook(() => useIsFormDirty(postA));
    const fieldIsDirty = renderHook(() => useIsFieldDirty(postA, title));
    expect(formDirty.result.current).toBe(false);
    expect(fieldIsDirty.result.current).toBe(false);

    act(() => useFormStore.getState().setFieldValue(postA, title, 'Edited'));
    expect(formDirty.result.current).toBe(true);
    expect(fieldIsDirty.result.current).toBe(true);
  });
});
