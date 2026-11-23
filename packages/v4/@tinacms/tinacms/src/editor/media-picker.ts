import { use, useEffect, useMemo } from 'react';
import { useStore } from 'zustand';
import { FormScopeContext } from './context';
import type { FormViewStore } from './form-view-state';

/** What a field asks of the media picker. The picker browses; the field owns every value. */
export interface MediaPickerRequest {
  /** `single` picks one image and confirms with Choose image. `multiple` picks several. */
  mode: 'single' | 'multiple';
  /** Names what the picker is for: "For <forLabel>". */
  forLabel: string;
  /** Names the parent of a nested field: "For <forLabel> in <parentLabel>". */
  parentLabel?: string;
  /** Names the requester. A second `open` with another target re-targets the open picker. */
  target: string;
  /** The media path being replaced, and whether the file is gone from Media. */
  replacing?: { path: string; missing: boolean };
  /** The element that opened the picker. Focus returns to it when the picker closes. */
  opener: HTMLElement | null;
  /**
   * The paths the field already holds. The picker reads the live value at `address` and
   * shows what `paths` returns for it as "Already added".
   */
  taken?: { address: string; paths: (value: unknown) => readonly string[] };
  /** Called with the picked paths, in pick order, when the editor confirms. */
  choose: (paths: string[]) => void;
}

export interface MediaPicker {
  open: (request: MediaPickerRequest) => void;
  /** Closes the picker without calling `choose`. */
  close: () => void;
}

/** The form's media picker. It works with or without `TinaAdmin` above the form. */
export function useMediaPicker(): MediaPicker {
  const scope = use(FormScopeContext);
  if (!scope) {
    throw new Error('useMediaPicker must be used within a FormProvider');
  }
  return useMemo(() => pickerOf(scope.view), [scope.view]);
}

export const pickerOf = (view: FormViewStore): MediaPicker => ({
  open: (request) => view.getState().openPicker(request),
  close: () => view.getState().closePicker(),
});

/**
 * The target of the open picker when this owner asked for it, else null. `owner` is the
 * owner's own target, or the start of its targets (`owner/…`) for a field that asks in
 * several ways. The picker closes, writing nothing, when the owner unmounts.
 */
export function useOwnedPickerTarget(owner: string): string | null {
  const scope = use(FormScopeContext);
  if (!scope) {
    throw new Error('useOwnedPickerTarget must be used within a FormProvider');
  }
  const { view } = scope;
  const owns = (target: string) =>
    target === owner || target.startsWith(`${owner}/`);
  const target = useStore(view, (state) =>
    state.picker !== null && owns(state.picker.target)
      ? state.picker.target
      : null
  );
  useEffect(
    () => () => {
      const { picker, closePicker } = view.getState();
      if (picker !== null && owns(picker.target)) closePicker();
    },
    [view, owner]
  );
  return target;
}
