import { useState } from 'react';
import { createStore, type StoreApi } from 'zustand';
import { type FieldAddress, toFieldAddress } from '../core/field/address';
import type { FieldDescriptor } from '../core/field/contract';
import {
  fieldsetOf,
  fieldsOf,
  itemHeadingOf,
  scalarItemOf,
} from '../core/schema/children';
import { OBJECT_FIELD_TYPE } from '../plugins/fields/object/object-field.schema';
import type { FieldSchema } from '../core/schema/types';
import type { FormId } from '../form/form-store';

export interface OpenLevel {
  address: FieldAddress;
  label: string;
  node: FieldSchema;
  /** An item of a list: `node` is a stand-in object built from the item's fields. */
  item?: boolean;
}

export interface FormViewState {
  touched: ReadonlySet<string>;
  saveAttempted: boolean;
  openLevels: readonly OpenLevel[];
  /** Expand all and Collapse all: cards and objects that open in place follow the newest one. */
  expansion: { readonly version: number; readonly open: boolean };
  setExpansion: (open: boolean) => void;
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
    expansion: { version: 0, open: false },
    setExpansion: (open) =>
      set((state) => ({
        expansion: { version: state.expansion.version + 1, open },
      })),
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

// An item's fields sit one level below the list, so an item opens as the next
// form level where its fields would be at the drill depth.
export const itemOpensNextLevel = (itemAddress: string): boolean =>
  fieldDepth(itemAddress) + 1 >= DRILL_DEPTH;

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

export const levelDrillsIn = (
  descriptor: FieldDescriptor | undefined,
  level: OpenLevel
): boolean =>
  level.item
    ? itemOpensNextLevel(level.address)
    : drillsInAt(descriptor, level.node, level.address);

// The stand-in node an open item level draws: an object of the item's fields.
// It sets no `display`, so the object field's depth rule does not apply.
export const itemLevel = (
  address: string,
  label: string,
  fields: readonly FieldSchema[]
): OpenLevel => {
  const node: FieldSchema & { fields: FieldSchema[] } = {
    type: OBJECT_FIELD_TYPE,
    name: address.split('.').at(-1) ?? address,
    label,
    fields: [...fields],
  };
  return { address: toFieldAddress(address), label, node, item: true };
};

// The failing fields that show an error, innermost only: a parent whose
// deeper error is also revealed counts through that deeper error.
const revealedLeaves = (
  view: Pick<FormViewState, 'touched' | 'saveAttempted'>,
  errorAddresses: readonly string[]
): string[] => {
  const revealed = errorAddresses.filter((key) => isRevealed(view, key));
  return revealed.filter(
    (key) => !revealed.some((other) => other.startsWith(`${key}.`))
  );
};

const isWithin = (key: string, address: string): boolean =>
  key === address || key.startsWith(`${address}.`);

export const holdsRevealedError = (
  view: Pick<FormViewState, 'touched' | 'saveAttempted'>,
  errorAddresses: readonly string[],
  address?: string
): boolean =>
  revealedLeaves(view, errorAddresses).some(
    (key) => address === undefined || isWithin(key, address)
  );

// How many fields under `address` hold a revealed error. Counts each failing
// field once, however many messages it has.
export const countRevealedErrors = (
  view: Pick<FormViewState, 'touched' | 'saveAttempted'>,
  errorAddresses: readonly string[],
  address: string
): number =>
  revealedLeaves(view, errorAddresses).filter((key) => isWithin(key, address))
    .length;

// Every named field and list item on the way to `address`, the field itself last.
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
      const item = valueAt(path);
      siblings =
        node && !scalarItemOf(node) ? fieldsetOf(node, item) : undefined;
      if (node && siblings) {
        along.push(
          itemLevel(path, itemHeadingOf(node, item, Number(segment)), siblings)
        );
      }
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
