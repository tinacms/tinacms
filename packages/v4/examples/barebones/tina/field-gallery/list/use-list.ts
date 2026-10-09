import { useEffect, useRef, useState } from 'react';

export interface ListItem<V> {
  id: string;
  value: V;
}

export interface ListLimits {
  min?: number;
  max?: number;
}

export interface ListNouns {
  one: string;
  many: string;
}

interface Removed<V> {
  item: ListItem<V>;
  index: number;
}

let nextId = 0;
export const newItem = <V>(value: V): ListItem<V> => ({
  id: `item-${++nextId}`,
  value,
});

export const UNDO_SECONDS = 8;
export const ADD_SLOT = 'add-slot';

// Focus that moves into one of the list's own popups (an item menu) has not
// left the list.
export const leftList = (event: React.FocusEvent<HTMLElement>) => {
  const next = event.relatedTarget;
  if (!(next instanceof Element)) return true;
  if (event.currentTarget.contains(next)) return false;
  return !next.closest('[data-slot$=-content]');
};

export function limitReasons(limits: ListLimits, nouns: ListNouns) {
  const { min, max } = limits;
  return {
    atMax:
      max === undefined
        ? ''
        : `Up to ${max} ${max === 1 ? nouns.one : nouns.many}.`,
    atMin:
      min === undefined
        ? ''
        : `At least ${min} ${min === 1 ? nouns.one : nouns.many}.`,
  };
}

// One list behaviour for every list: plain values, groups, blocks and images.
export function useList<V>({
  items,
  onChange,
  limits,
  nouns,
  describe,
  makeEmpty,
  locked,
}: {
  items: ListItem<V>[];
  onChange: (items: ListItem<V>[]) => void;
  limits: ListLimits;
  nouns: ListNouns;
  describe: (value: V) => string;
  makeEmpty: () => V;
  locked: boolean;
}) {
  const [removed, setRemoved] = useState<Removed<V> | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [focusId, setFocusId] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  const canAdd =
    !locked && (limits.max === undefined || items.length < limits.max);
  const canRemove =
    !locked && (limits.min === undefined || items.length > limits.min);
  const name = (value: V) => describe(value) || `empty ${nouns.one}`;

  const insert = (index: number, item: ListItem<V>, focus = true) => {
    if (!canAdd) return;
    onChange([...items.slice(0, index), item, ...items.slice(index)]);
    if (focus) setFocusId(item.id);
  };

  const canUndo =
    removed !== null && (limits.max === undefined || items.length < limits.max);

  return {
    canAdd,
    canRemove,
    canUndo,
    removed,
    announcement,
    focusId,
    clearFocus: () => setFocusId(null),
    add: (index = items.length) => {
      const item = newItem(makeEmpty());
      insert(index, item);
      return canAdd ? item.id : null;
    },
    append: (value: V) => {
      insert(items.length, newItem(value), false);
      setAnnouncement(`Added “${name(value)}”.`);
    },
    duplicate: (index: number) => {
      insert(index + 1, newItem(items[index].value));
      setAnnouncement(`Duplicated “${name(items[index].value)}”.`);
    },
    update: (index: number, value: V) =>
      onChange(
        items.map((item, i) => (i === index ? { ...item, value } : item))
      ),
    move: (from: number, to: number) => {
      if (locked || to < 0 || to >= items.length || from === to) return;
      const next = [...items];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      onChange(next);
      setAnnouncement(
        `Moved “${name(item.value)}” to position ${to + 1} of ${items.length}.`
      );
    },
    remove: (index: number) => {
      if (!canRemove) return;
      const item = items[index];
      const neighbour = items[index + 1] ?? items[index - 1];
      onChange(items.filter((_, i) => i !== index));
      setFocusId(neighbour ? neighbour.id : ADD_SLOT);
      setRemoved({ item, index });
      setAnnouncement(
        `Removed “${name(item.value)}”. Undo is available for ${UNDO_SECONDS} seconds.`
      );
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setRemoved(null), UNDO_SECONDS * 1000);
    },
    undo: () => {
      if (!removed || !canUndo) return;
      const index = Math.min(removed.index, items.length);
      onChange([...items.slice(0, index), removed.item, ...items.slice(index)]);
      setFocusId(removed.item.id);
      setAnnouncement(`Restored “${name(removed.item.value)}”.`);
      setRemoved(null);
      if (timer.current) clearTimeout(timer.current);
    },
  };
}
