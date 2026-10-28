import { useCallback, useMemo, useState } from 'react';
import type { FieldAddress } from '../core/field/address';
import { fieldsetOf, fieldsOf, scalarItemOf } from '../core/schema/children';
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
  resetReveal: () => void;
  openLevels: readonly OpenLevel[];
  openLevel: (level: OpenLevel) => void;
  showLevels: (levels: readonly OpenLevel[]) => void;
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
  const resetReveal = useCallback(
    () =>
      update((state) => ({
        ...state,
        touched: new Set(),
        saveAttempted: false,
      })),
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
  const showLevels = useCallback(
    (levels: readonly OpenLevel[]) =>
      update((state) => ({ ...state, openLevels: levels })),
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
      resetReveal,
      openLevels: current.openLevels,
      openLevel,
      showLevels,
      closeLevelsAbove,
    }),
    [
      current.touched,
      current.saveAttempted,
      current.openLevels,
      touch,
      attemptSave,
      resetReveal,
      openLevel,
      showLevels,
      closeLevelsAbove,
    ]
  );
}

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

// Array positions are not levels.
export const DRILL_DEPTH = 3;

export const fieldDepth = (address: string): number =>
  address.split('.').filter((part) => !/^\d+$/.test(part)).length;

export const holdsRevealedError = (
  view: Pick<FormViewState, 'touched' | 'saveAttempted'>,
  errorAddresses: readonly string[],
  address?: string
): boolean => {
  const own = errorAddresses.filter(
    (key) => !errorAddresses.some((other) => other.startsWith(`${key}.`))
  );
  return own.some(
    (key) =>
      (address === undefined ||
        key === address ||
        key.startsWith(`${address}.`)) &&
      isRevealed(view, key)
  );
};

// The levels that must be open for the field at `address` to be on screen.
export const levelsFor = (
  address: string,
  fields: readonly FieldSchema[],
  valueAt: (address: string) => unknown,
  isDrillable: (node: FieldSchema) => boolean
): OpenLevel[] => {
  const levels: OpenLevel[] = [];
  let siblings: readonly FieldSchema[] | undefined = fields;
  let node: FieldSchema | undefined;
  let path = '';
  for (const segment of address.split('.')) {
    path = path ? `${path}.${segment}` : segment;
    if (/^\d+$/.test(segment)) {
      siblings =
        node && !scalarItemOf(node)
          ? fieldsetOf(node, valueAt(path))
          : undefined;
      continue;
    }
    node = siblings?.find((field) => field.name === segment);
    if (!node) break;
    if (
      path !== address &&
      isDrillable(node) &&
      fieldDepth(path) >= DRILL_DEPTH
    ) {
      levels.push({
        address: path as FieldAddress,
        label: node.label ?? node.name,
        node,
      });
    }
    siblings = fieldsOf(node);
  }
  return levels;
};
