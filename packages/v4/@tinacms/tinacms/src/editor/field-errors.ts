import { type FieldValues, set } from 'react-hook-form';
import { fieldsetOf, fieldsOf, scalarItemOf } from '../core/schema/children';
import type { FieldSchema } from '../core/schema/types';

export interface FieldErrorEntry {
  type: string;
  message?: string;
  types?: Record<string, string>;
}

export const toFieldErrorEntry = (messages: string[]): FieldErrorEntry => ({
  type: 'validation',
  message: messages[0],
  types: Object.fromEntries(
    messages.map((message, index) => [String(index), message])
  ),
});

export const fieldErrorMessages = (
  entry: FieldErrorEntry | undefined
): string[] => {
  if (!entry) return [];
  if (entry.types) return Object.values(entry.types).filter(Boolean);
  return entry.message ? [entry.message] : [];
};

const ENTRY_KEYS = new Set(['type', 'message', 'types']);

const isFieldErrorEntry = (value: unknown): value is FieldErrorEntry =>
  typeof value === 'object' && value !== null && 'type' in value;

// Collects every message under `node`, including `node` itself. A compound
// field's own address is never an entry once it has a child error —
// react-hook-form coerces a `useFieldArray` address into a plain array, and
// drops any sibling `type`/`message` there. Walking down is how a parent
// address still shows what is wrong underneath it.
export const collectFieldErrorMessages = (node: unknown): string[] => {
  const messages = new Set(
    isFieldErrorEntry(node) ? fieldErrorMessages(node) : []
  );
  if (node && typeof node === 'object') {
    for (const [key, child] of Object.entries(node)) {
      if (ENTRY_KEYS.has(key)) continue;
      for (const message of collectFieldErrorMessages(child)) {
        messages.add(message);
      }
    }
  }
  return [...messages];
};

// Mirrors the react-hook-form error tree into `FieldErrors`, the flat
// address -> messages map the form-state store keeps. Every address gets an
// entry, not only leaf entries, since `collectFieldErrorMessages` also walks
// down from each prefix.
export const flattenFieldErrors = (
  node: unknown,
  prefix = '',
  out: Record<string, string[]> = {}
): Record<string, string[]> => {
  if (prefix) {
    const messages = collectFieldErrorMessages(node);
    if (messages.length > 0) out[prefix] = messages;
  }
  if (node && typeof node === 'object') {
    for (const [key, child] of Object.entries(node)) {
      if (ENTRY_KEYS.has(key)) continue;
      flattenFieldErrors(child, prefix ? `${prefix}.${key}` : key, out);
    }
  }
  return out;
};

// `flattenFieldErrors` also lists every parent address of a failing field, so
// only addresses with no failing descendant are failing fields themselves. A
// compound field's own error is hidden here; the error summary promotes it once
// its children are fixed.
export const failingLeaves = (addresses: readonly string[]): string[] =>
  addresses.filter(
    (address) => !addresses.some((other) => other.startsWith(`${address}.`))
  );

export const countFailingFields = (addresses: readonly string[]): number =>
  failingLeaves(addresses).length;

const orderKey = (
  address: string,
  fields: readonly FieldSchema[],
  valueAt: (address: string) => unknown
): number[] => {
  const key: number[] = [];
  let siblings: readonly FieldSchema[] | undefined = fields;
  let node: FieldSchema | undefined;
  let path = '';
  for (const segment of address.split('.')) {
    path = path ? `${path}.${segment}` : segment;
    if (/^\d+$/.test(segment)) {
      key.push(Number(segment));
      siblings =
        node && !scalarItemOf(node)
          ? fieldsetOf(node, valueAt(path))
          : undefined;
      continue;
    }
    const index = siblings?.findIndex((field) => field.name === segment) ?? -1;
    key.push(index);
    node = index >= 0 ? siblings?.[index] : undefined;
    siblings = node ? fieldsOf(node) : undefined;
  }
  return key;
};

export const inDocumentOrder = <T extends { address: string }>(
  entries: readonly T[],
  fields: readonly FieldSchema[],
  valueAt: (address: string) => unknown
): T[] =>
  entries
    .map((entry) => ({ entry, key: orderKey(entry.address, fields, valueAt) }))
    .sort((a, b) => {
      const length = Math.min(a.key.length, b.key.length);
      for (let i = 0; i < length; i++) {
        const difference = (a.key[i] ?? 0) - (b.key[i] ?? 0);
        if (difference !== 0) return difference;
      }
      return a.key.length - b.key.length;
    })
    .map(({ entry }) => entry);

export type ListChange =
  | { insert: number }
  | { remove: number }
  | { move: readonly [from: number, to: number] };

export const rekeyAddresses = (
  addresses: readonly string[],
  listAddress: string,
  change: ListChange
): string[] => {
  const prefix = `${listAddress}.`;
  const out: string[] = [];
  for (const address of addresses) {
    if (!address.startsWith(prefix)) {
      out.push(address);
      continue;
    }
    const rest = address.slice(prefix.length);
    const dot = rest.indexOf('.');
    const index = Number(dot === -1 ? rest : rest.slice(0, dot));
    const tail = dot === -1 ? '' : rest.slice(dot);
    if (!Number.isInteger(index)) {
      out.push(address);
      continue;
    }
    let next: number | null = index;
    if ('insert' in change) {
      if (index >= change.insert) next = index + 1;
    } else if ('remove' in change) {
      if (index === change.remove) next = null;
      else if (index > change.remove) next = index - 1;
    } else {
      const [from, to] = change.move;
      if (index === from) next = to;
      else if (from < to && index > from && index <= to) next = index - 1;
      else if (from > to && index >= to && index < from) next = index + 1;
    }
    if (next !== null) out.push(`${prefix}${next}${tail}`);
  }
  return out;
};

// The inverse of `flattenFieldErrors`. `set` on a single-segment path is a
// plain assignment, not a merge, so a shallow address written after a deeper
// one wipes it out. Sorting shallowest first keeps a compound field's own
// message and its children's messages both in the tree.
export const nestFieldErrors = (
  flat: Record<string, string[] | undefined>
): FieldValues => {
  const tree: FieldValues = {};
  const addresses = Object.keys(flat).sort(
    (a, b) => a.split('.').length - b.split('.').length
  );
  for (const address of addresses) {
    const messages = flat[address];
    if (messages?.length) set(tree, address, toFieldErrorEntry(messages));
  }
  return tree;
};

export const ownFieldErrors = (
  node: unknown,
  prefix: string,
  out: Record<string, string[]> = {}
): Record<string, string[]> => {
  if (isFieldErrorEntry(node)) {
    const messages = fieldErrorMessages(node);
    if (messages.length > 0) out[prefix] = messages;
  }
  if (node && typeof node === 'object') {
    for (const [key, child] of Object.entries(node)) {
      if (ENTRY_KEYS.has(key)) continue;
      ownFieldErrors(child, `${prefix}.${key}`, out);
    }
  }
  return out;
};
