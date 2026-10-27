import { useCallback, useMemo, useState } from 'react';
import type { FieldAddress } from '../core/field/address';
import type { FieldSchema } from '../core/schema/types';
import type { FormId } from '../form/form-store';

export interface OpenLevel {
  address: FieldAddress;
  label: string;
  node: FieldSchema;
}

export interface FormViewState {
  touched: ReadonlySet<string>;
  saveAttempted: boolean;
  touch: (address: FieldAddress) => void;
  attemptSave: () => void;
  openLevels: readonly OpenLevel[];
  openLevel: (level: OpenLevel) => void;
  closeLevelsAbove: (keep: number) => void;
}

interface Tracked {
  formId: FormId;
  touched: ReadonlySet<string>;
  saveAttempted: boolean;
  openLevels: readonly OpenLevel[];
}

const fresh = (formId: FormId): Tracked => ({
  formId,
  touched: new Set(),
  saveAttempted: false,
  openLevels: [],
});

// What the editor has done in one form that decides what the form shows: which
// fields were left, whether a save was tried, and which nested levels are open.
// Tracked per form id, so opening another document starts clean.
export function useFormViewState(formId: FormId): FormViewState {
  const [tracked, setTracked] = useState<Tracked>(() => fresh(formId));
  const current = tracked.formId === formId ? tracked : fresh(formId);

  const update = useCallback(
    (change: (state: Tracked) => Tracked) =>
      setTracked((previous) =>
        change(previous.formId === formId ? previous : fresh(formId))
      ),
    [formId]
  );
  const touch = useCallback(
    (address: FieldAddress) =>
      update((state) =>
        state.touched.has(address)
          ? state
          : { ...state, touched: new Set(state.touched).add(address) }
      ),
    [update]
  );
  const attemptSave = useCallback(
    () => update((state) => ({ ...state, saveAttempted: true })),
    [update]
  );
  const openLevel = useCallback(
    (level: OpenLevel) =>
      update((state) => ({
        ...state,
        openLevels: [...state.openLevels, level],
      })),
    [update]
  );
  const closeLevelsAbove = useCallback(
    (keep: number) =>
      update((state) => ({
        ...state,
        openLevels: state.openLevels.slice(0, keep),
      })),
    [update]
  );

  return useMemo(
    () => ({
      touched: current.touched,
      saveAttempted: current.saveAttempted,
      touch,
      attemptSave,
      openLevels: current.openLevels,
      openLevel,
      closeLevelsAbove,
    }),
    [
      current.touched,
      current.saveAttempted,
      current.openLevels,
      touch,
      attemptSave,
      openLevel,
      closeLevelsAbove,
    ]
  );
}

// An error shows once the editor leaves the field (or anything inside it), or
// after a save was tried.
export const isRevealed = (
  view: Pick<FormViewState, 'touched' | 'saveAttempted'>,
  address: string
): boolean => {
  if (view.saveAttempted) return true;
  for (const touched of view.touched) {
    if (touched === address || touched.startsWith(`${address}.`)) return true;
  }
  return false;
};

// A compound field at the third level of nesting or deeper opens as its own
// form level. Array positions are not levels.
export const DRILL_DEPTH = 3;

export const fieldDepth = (address: string): number =>
  address.split('.').filter((part) => !/^\d+$/.test(part)).length;
