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
import type { FieldLock } from './context';
import { type ListChange, rekeyAddresses } from './field-errors';

export interface OpenLevel {
  address: FieldAddress;
  label: string;
  node: FieldSchema;
  /** An item of a list: `node` is a stand-in object built from the item's fields. */
  item?: boolean;
  /** A block of a Blocks field. It opens as its own level at any depth. */
  block?: boolean;
}

export interface BlockedField {
  readonly key: string;
  readonly address: string;
}

export interface ErrorSummary {
  readonly blocked: readonly BlockedField[];
  /** Failing addresses the leaf filter dropped at Save time; one becomes a row once it is a leaf. */
  readonly hiddenParents: readonly string[];
  readonly paneOpen: boolean;
  readonly current: string | null;
  /** Where the viewed row stood when its field was fixed, so Resolve carries on from there. */
  readonly resumeAt: number | null;
  readonly done: 'pane' | 'button' | null;
  readonly focusRow: boolean;
  readonly announcement: string;
}

const IDLE_SUMMARY: ErrorSummary = {
  blocked: [],
  hiddenParents: [],
  paneOpen: false,
  current: null,
  resumeAt: null,
  done: null,
  focusRow: false,
  announcement: '',
};

// Marks a field whose list item was removed. Nothing fails there, so the next `fix` counts it fixed.
export const REMOVED = '#removed';

export const ALL_FIXED = 'All fixed. You’re ready to save.';

const errorCountWords = (count: number) =>
  `${count} ${count === 1 ? 'error' : 'errors'}`;

export interface FormViewState {
  errorSummary: ErrorSummary;
  blockedSaves: number;
  block: (
    addresses: readonly string[],
    hiddenParents?: readonly string[]
  ) => void;
  fix: (
    remaining: ReadonlySet<string>,
    labelOf: (address: string) => string,
    currentIndex: number | null
  ) => void;
  openPane: (focusRow: boolean) => void;
  tuckPane: () => void;
  goTo: (key: string) => string | undefined;
  endDone: () => void;
  rekey: (listAddress: string, change: ListChange) => void;
  reset: () => void;
  touched: ReadonlySet<string>;
  saveAttempted: boolean;
  openLevels: readonly OpenLevel[];
  /** The address of the level the editor just left by going up, until a list takes it back. */
  returnedFrom: string | null;
  /** Expand all and Collapse all: cards and objects that open in place follow the newest one. */
  expansion: { readonly version: number; readonly open: boolean };
  setExpansion: (open: boolean) => void;
  touch: (address: FieldAddress) => void;
  removeListItem: (listAddress: string, index: number) => void;
  insertListItem: (listAddress: string, index: number) => void;
  moveListItem: (listAddress: string, from: number, to: number) => void;
  attemptSave: () => void;
  resetReveal: () => void;
  openLevel: (level: OpenLevel) => void;
  showLevels: (levels: readonly OpenLevel[]) => void;
  closeLevelsAbove: (keep: number) => void;
  clearReturn: () => void;
}

export type FormViewStore = StoreApi<FormViewState>;

export const shiftAddressOnRemove = (
  address: string,
  listAddress: string,
  index: number
): string | null => {
  const prefix = `${listAddress}.`;
  if (!address.startsWith(prefix)) return address;
  const rest = address.slice(prefix.length);
  const dot = rest.indexOf('.');
  const numStr = dot === -1 ? rest : rest.slice(0, dot);
  const subpath = dot === -1 ? '' : rest.slice(dot);
  const pos = Number(numStr);
  if (!Number.isInteger(pos)) return address;
  if (pos === index) return null;
  if (pos > index) return `${prefix}${pos - 1}${subpath}`;
  return address;
};

export const shiftAddressOnMove = (
  address: string,
  listAddress: string,
  from: number,
  to: number
): string => {
  const prefix = `${listAddress}.`;
  if (!address.startsWith(prefix)) return address;
  const rest = address.slice(prefix.length);
  const dot = rest.indexOf('.');
  const numStr = dot === -1 ? rest : rest.slice(0, dot);
  const subpath = dot === -1 ? '' : rest.slice(dot);
  const pos = Number(numStr);
  if (!Number.isInteger(pos)) return address;
  if (pos === from) return `${prefix}${to}${subpath}`;
  if (from < to && pos > from && pos <= to)
    return `${prefix}${pos - 1}${subpath}`;
  if (from > to && pos >= to && pos < from)
    return `${prefix}${pos + 1}${subpath}`;
  return address;
};

export const createFormViewStore = (): FormViewStore => {
  let keys = 0;
  return createStore<FormViewState>()((set, get) => ({
    errorSummary: IDLE_SUMMARY,
    blockedSaves: 0,
    block: (addresses, hiddenParents = []) =>
      set((state) => ({
        blockedSaves: state.blockedSaves + 1,
        errorSummary: {
          ...IDLE_SUMMARY,
          blocked: addresses.map((address) => ({
            key: `e${++keys}`,
            address,
          })),
          hiddenParents: [...hiddenParents],
          paneOpen: true,
        },
      })),
    fix: (remaining, labelOf, currentIndex) =>
      set((state) => {
        const summary = state.errorSummary;
        const stillListed = summary.blocked.filter((entry) =>
          remaining.has(entry.address)
        );
        const failing = [...remaining];
        const promoted = summary.hiddenParents.filter(
          (parent) =>
            remaining.has(parent) &&
            !failing.some((address) => address.startsWith(`${parent}.`)) &&
            !summary.blocked.some(
              (entry) =>
                entry.address.endsWith(REMOVED) &&
                entry.address.startsWith(`${parent}.`)
            )
        );
        const kept = [
          ...stillListed,
          ...promoted.map(
            (address): BlockedField => ({
              key: `e${++keys}`,
              address,
            })
          ),
        ];
        const hiddenParents = summary.hiddenParents.filter(
          (parent) => remaining.has(parent) && !promoted.includes(parent)
        );
        const fixed = summary.blocked.filter(
          (entry) => !remaining.has(entry.address)
        );
        if (summary.blocked.length === 0 || fixed.length === 0) return state;
        if (kept.length === 0) {
          return {
            errorSummary: {
              ...summary,
              blocked: [],
              hiddenParents: [],
              current: null,
              resumeAt: null,
              done: summary.paneOpen ? 'pane' : 'button',
              announcement: ALL_FIXED,
            },
            touched: new Set(),
            saveAttempted: false,
          };
        }
        const [first] = fixed;
        const left = errorCountWords(kept.length);
        const currentFixed = fixed.some(
          (entry) => entry.key === summary.current
        );
        return {
          errorSummary: {
            ...summary,
            blocked: kept,
            hiddenParents,
            current: currentFixed ? null : summary.current,
            resumeAt: currentFixed ? currentIndex : summary.resumeAt,
            announcement:
              fixed.length === 1 && first && !first.address.endsWith(REMOVED)
                ? `${labelOf(first.address)} fixed. ${left} left.`
                : `${left} left.`,
          },
        };
      }),
    openPane: (focusRow) =>
      set((state) =>
        state.errorSummary.blocked.length === 0
          ? state
          : {
              errorSummary: { ...state.errorSummary, paneOpen: true, focusRow },
            }
      ),
    tuckPane: () =>
      set((state) => ({
        errorSummary: {
          ...state.errorSummary,
          paneOpen: false,
          focusRow: false,
        },
      })),
    goTo: (key) => {
      const entry = get().errorSummary.blocked.find((item) => item.key === key);
      if (!entry) return undefined;
      set((state) => ({
        errorSummary: { ...state.errorSummary, current: key, resumeAt: null },
      }));
      return entry.address;
    },
    endDone: () =>
      set((state) =>
        state.errorSummary.done === null
          ? state
          : { errorSummary: { ...IDLE_SUMMARY } }
      ),
    rekey: (listAddress, change) =>
      set((state) => {
        const { blocked } = state.errorSummary;
        if (blocked.length === 0) return state;
        const next = blocked.map((entry): BlockedField => {
          const [address] = rekeyAddresses(
            [entry.address],
            listAddress,
            change
          );
          return {
            key: entry.key,
            address: address ?? `${entry.address}${REMOVED}`,
          };
        });
        return {
          errorSummary: {
            ...state.errorSummary,
            blocked: next,
            hiddenParents: rekeyAddresses(
              state.errorSummary.hiddenParents,
              listAddress,
              change
            ),
          },
        };
      }),
    reset: () => set({ errorSummary: IDLE_SUMMARY }),
    touched: new Set(),
    saveAttempted: false,
    openLevels: [],
    returnedFrom: null,
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
    removeListItem: (listAddress, index) =>
      set((state) => {
        const nextTouched = new Set<string>();
        for (const address of state.touched) {
          const shifted = shiftAddressOnRemove(address, listAddress, index);
          if (shifted !== null) nextTouched.add(shifted);
        }
        const nextLevels: OpenLevel[] = [];
        for (const level of state.openLevels) {
          const shifted = shiftAddressOnRemove(
            level.address,
            listAddress,
            index
          );
          if (shifted !== null) {
            nextLevels.push(
              shifted === level.address
                ? level
                : { ...level, address: toFieldAddress(shifted) }
            );
          }
        }
        return { touched: nextTouched, openLevels: nextLevels };
      }),
    insertListItem: (listAddress, index) =>
      set((state) => {
        const nextTouched = new Set<string>();
        for (const address of state.touched) {
          const [shifted] = rekeyAddresses([address], listAddress, {
            insert: index,
          });
          if (shifted) nextTouched.add(shifted);
        }
        const nextLevels = state.openLevels.map((level) => {
          const [shifted] = rekeyAddresses([level.address], listAddress, {
            insert: index,
          });
          return shifted && shifted !== level.address
            ? { ...level, address: toFieldAddress(shifted) }
            : level;
        });
        return { touched: nextTouched, openLevels: nextLevels };
      }),
    moveListItem: (listAddress, from, to) =>
      set((state) => {
        const nextTouched = new Set<string>();
        for (const address of state.touched) {
          nextTouched.add(shiftAddressOnMove(address, listAddress, from, to));
        }
        const nextLevels = state.openLevels.map((level) => {
          const shifted = shiftAddressOnMove(
            level.address,
            listAddress,
            from,
            to
          );
          return shifted === level.address
            ? level
            : { ...level, address: toFieldAddress(shifted) };
        });
        return { touched: nextTouched, openLevels: nextLevels };
      }),
    attemptSave: () => set({ saveAttempted: true }),
    resetReveal: () => set({ touched: new Set(), saveAttempted: false }),
    openLevel: (level) =>
      set((state) => ({
        openLevels: [...state.openLevels, level],
        returnedFrom: null,
      })),
    showLevels: (levels) => set({ openLevels: levels, returnedFrom: null }),
    closeLevelsAbove: (keep) =>
      set((state) => ({
        openLevels: state.openLevels.slice(0, keep),
        returnedFrom: state.openLevels[keep]?.address ?? null,
      })),
    clearReturn: () => set({ returnedFrom: null }),
  }));
};

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

// The one place that decides whether a field drills in. From level 3 down every
// drillable field drills in, whatever its own answer. Above that, the plugin's
// answer wins.
export const drillsInAt = (
  descriptor: FieldDescriptor | undefined,
  node: FieldSchema,
  address: string
): boolean => {
  const metadata = descriptor?.metadata;
  if (metadata?.drillable !== true) return false;
  if (fieldDepth(address) >= DRILL_DEPTH) return true;
  return metadata.drillsIn?.(node) ?? false;
};

export const levelDrillsIn = (
  descriptor: FieldDescriptor | undefined,
  level: OpenLevel
): boolean =>
  level.item
    ? level.block === true || itemOpensNextLevel(level.address)
    : drillsInAt(descriptor, level.node, level.address);

// The stand-in node an open item level draws: an object of the item's fields.
// It sets no `display`, so the object field's depth rule does not apply.
export const itemLevel = (
  address: string,
  label: string,
  fields: readonly FieldSchema[],
  block = false
): OpenLevel => {
  const node: FieldSchema & { fields: FieldSchema[] } = {
    type: OBJECT_FIELD_TYPE,
    name: address.split('.').at(-1) ?? address,
    label,
    fields: [...fields],
  };
  return {
    address: toFieldAddress(address),
    label,
    node,
    item: true,
    ...(block ? { block } : {}),
  };
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
          itemLevel(
            path,
            itemHeadingOf(node, item, Number(segment)),
            siblings,
            node.templates !== undefined
          )
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

// The lock an open level inherits from the fields above it. The level's own
// field locks itself.
export const lockAbove = (
  address: string,
  fields: readonly FieldSchema[],
  valueAt: (address: string) => unknown
): FieldLock => {
  const above = fieldsAlong(address, fields, valueAt).filter(
    (step) => step.address !== address
  );
  return {
    disabled: above.some((step) => step.node.disabled === true),
    readOnly: above.some((step) => step.node.readOnly === true),
  };
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
