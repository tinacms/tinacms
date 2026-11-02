import { useState } from 'react';
import { createStore, type StoreApi } from 'zustand';
import type { FieldAddress } from '../core/field/address';
import type { FieldDescriptor } from '../core/field/contract';
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
  openLevels: readonly OpenLevel[];
  touch: (address: FieldAddress) => void;
  attemptSave: () => void;
  resetReveal: () => void;
  openLevel: (level: OpenLevel) => void;
  showLevels: (levels: readonly OpenLevel[]) => void;
  closeLevelsAbove: (keep: number) => void;
}

export type FormViewStore = StoreApi<FormViewState>;

export const createFormViewStore = (): FormViewStore =>
  createStore<FormViewState>()((set) => ({
    touched: new Set(),
    saveAttempted: false,
    openLevels: [],
    touch: (address) =>
      set((state) =>
        state.touched.has(address)
          ? state
          : { touched: new Set(state.touched).add(address) }
      ),
    attemptSave: () => set({ saveAttempted: true }),
    resetReveal: () => set({ touched: new Set(), saveAttempted: false }),
    openLevel: (level) =>
      set((state) => ({ openLevels: [...state.openLevels, level] })),
    showLevels: (levels) => set({ openLevels: levels }),
    closeLevelsAbove: (keep) =>
      set((state) => ({ openLevels: state.openLevels.slice(0, keep) })),
  }));

export function useFormViewStore(formId: FormId): FormViewStore {
  const [held, setHeld] = useState(() => ({
    formId,
    store: createFormViewStore(),
  }));
  if (held.formId === formId) return held.store;
  const next = { formId, store: createFormViewStore() };
  setHeld(next);
  return next.store;
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
const DRILL_DEPTH = 3;

const fieldDepth = (address: string): number =>
  address.split('.').filter((part) => !/^\d+$/.test(part)).length;

// The one place that decides whether a field drills in: the plugin's own
// answer first, then the depth rule.
export const drillsInAt = (
  descriptor: FieldDescriptor | undefined,
  node: FieldSchema,
  address: string
): boolean => {
  const metadata = descriptor?.metadata;
  if (metadata?.drillable !== true) return false;
  return metadata.drillsIn?.(node) ?? fieldDepth(address) >= DRILL_DEPTH;
};

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

// How many fields under `address` hold a revealed error. Counts each failing
// field once, however many messages it has.
export const countRevealedErrors = (
  view: Pick<FormViewState, 'touched' | 'saveAttempted'>,
  errorAddresses: readonly string[],
  address: string
): number =>
  errorAddresses.filter(
    (key) =>
      (key === address || key.startsWith(`${address}.`)) &&
      !errorAddresses.some((other) => other.startsWith(`${key}.`)) &&
      isRevealed(view, key)
  ).length;

// Every named field on the way to `address`, the field itself last.
export const fieldsAlong = (
  address: string,
  fields: readonly FieldSchema[],
  valueAt: (address: string) => unknown
): OpenLevel[] => {
  const along: OpenLevel[] = [];
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
    along.push({
      address: path as FieldAddress,
      label: node.label ?? node.name,
      node,
    });
    siblings = fieldsOf(node);
  }
  return along;
};

// The levels that must be open for the field at `address` to be on screen.
export const levelsFor = (
  address: string,
  fields: readonly FieldSchema[],
  valueAt: (address: string) => unknown,
  drillsIn: (step: OpenLevel) => boolean
): OpenLevel[] =>
  fieldsAlong(address, fields, valueAt).filter(
    (step) => step.address !== address && drillsIn(step)
  );
