import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  useFieldAddress,
  useFieldFrame,
  useFieldSchema,
  useFieldValue,
  useFormId,
  useListItems,
  useMediaSlice,
} from '../../../editor';
import { useMediaPicker, useOwnedPicker } from '../../../editor/media-picker';
import { useFormStore } from '../../../form/form-store';
import { ImageGalleryView } from './image-gallery.view';
import { useParentLabel } from './image-picker';

let galleryKeyCount = 0;
const nextGalleryKey = (): string => `image-item-${galleryKeyCount++}`;

const pathsOf = (items: readonly unknown[]): string[] =>
  items.filter((item): item is string => typeof item === 'string');

export function ImageGallery() {
  const address = useFieldAddress();
  const frame = useFieldFrame();
  const field = useFieldSchema();
  const media = useMediaSlice();
  const listItems = useListItems();
  const formId = useFormId();
  const active = useFormStore((state) => state.active);
  const { getValues } = useFormContext();
  const [value, setValue] = useFieldValue<unknown[] | undefined>(address);
  const items = value ?? [];
  const keys = useRef<string[]>([]);
  if (keys.current.length !== items.length) {
    keys.current = items.map(nextGalleryKey);
  }
  const [focusRequest, setFocusRequest] = useState<{ index: number }>();
  const [missing, setMissing] = useState<ReadonlySet<string>>(new Set());

  const picker = useMediaPicker();
  const parentLabel = useParentLabel(address);
  const { owner, target: openTarget } = useOwnedPicker();
  const tilePrefix = `${owner}/tile:`;
  const addTarget = `${owner}/add`;
  const choosingAdd = openTarget === addTarget;
  const latestAddress = useRef(address);
  useLayoutEffect(() => {
    latestAddress.current = address;
  });
  const choosingKey = openTarget?.startsWith(tilePrefix)
    ? openTarget.slice(tilePrefix.length)
    : undefined;

  useEffect(() => {
    if (active?.formId !== formId || !active.address.startsWith(`${address}.`))
      return;
    const index = Number(active.address.slice(address.length + 1));
    if (Number.isInteger(index)) setFocusRequest({ index });
  }, [active, formId, address]);

  const liveItems = (): unknown[] => getValues(address) ?? [];

  // A request outlives this render. Its callbacks read the newest render's closures.
  const confirm = useRef((_target: string, _paths: string[]) => {});
  useLayoutEffect(() => {
    confirm.current = (target, paths) => {
      if (target === addTarget) {
        const before = liveItems().length;
        keys.current = [...keys.current, ...paths.map(nextGalleryKey)];
        setValue([...liveItems(), ...paths]);
        setFocusRequest({ index: before });
        return;
      }
      const index = keys.current.indexOf(target.slice(tilePrefix.length));
      const [picked] = paths;
      if (index === -1 || picked === undefined) return;
      setFocusRequest({ index });
      if (liveItems()[index] === picked) return;
      setValue(liveItems().map((item, at) => (at === index ? picked : item)));
    };
  });

  const request = (target: string, opener: HTMLElement | null) => ({
    forLabel: field.label ?? field.name,
    parentLabel,
    target,
    opener,
    choose: (paths: string[]) => confirm.current(target, paths),
  });

  // The gallery's address changes when its own list item moves, so "Already added" reads the newest.
  const takenAt = (paths: (held: unknown) => readonly string[]) => ({
    get address() {
      return latestAddress.current;
    },
    paths,
  });

  const addRequest = (opener: HTMLElement | null) => ({
    ...request(addTarget, opener),
    mode: 'multiple' as const,
    taken: takenAt((held) => pathsOf(heldList(held))),
  });

  const replaceRequest = (key: string, opener: HTMLElement | null) => {
    const current = liveItems()[keys.current.indexOf(key)];
    return {
      ...request(`${tilePrefix}${key}`, opener),
      mode: 'single' as const,
      replacing:
        typeof current === 'string'
          ? { path: current, missing: missing.has(key) }
          : undefined,
      taken: takenAt((held) =>
        pathsOf(
          heldList(held).filter((_, at) => at !== keys.current.indexOf(key))
        )
      ),
    };
  };

  const opener = useRef<HTMLElement | null>(null);
  // A slow load can flip a tile's `missing` after its picker opened: send the request again.
  const choosingMissing = choosingKey !== undefined && missing.has(choosingKey);
  useEffect(() => {
    if (choosingKey !== undefined) {
      picker.open(replaceRequest(choosingKey, opener.current));
    }
  }, [choosingMissing]);

  // Moving a parent list item changes `address` after `MediaPickerPanel` may have
  // rendered with the old `latestAddress`; re-send the request so "Already added" reads the new path.
  const previousAddress = useRef(address);
  useEffect(() => {
    if (previousAddress.current === address) return;
    previousAddress.current = address;
    if (choosingAdd) {
      picker.open(addRequest(opener.current));
    } else if (choosingKey !== undefined) {
      picker.open(replaceRequest(choosingKey, opener.current));
    }
  }, [address]);

  return (
    <ImageGalleryView
      {...frame}
      items={items.map((value, index) => ({
        key: keys.current[index] ?? String(index),
        value,
      }))}
      resolveUrl={media.resolveUrl}
      focusRequest={focusRequest}
      choosingKey={choosingKey}
      onMissingChange={(key, isMissing) =>
        setMissing((previous) => {
          if (previous.has(key) === isMissing) return previous;
          const next = new Set(previous);
          if (isMissing) next.add(key);
          else next.delete(key);
          return next;
        })
      }
      choosingAdd={choosingAdd}
      onAdd={(from) => {
        opener.current = from;
        picker.open(addRequest(from));
      }}
      onReplace={(key, from) => {
        opener.current = from;
        picker.open(replaceRequest(key, from));
      }}
      onRemove={(index) => {
        const removed = keys.current[index];
        if (removed !== undefined && choosingKey === removed) picker.close();
        keys.current = keys.current.filter((_, position) => position !== index);
        listItems.remove(address, index, () =>
          setValue(liveItems().filter((_, position) => position !== index))
        );
      }}
      onMove={(from, to) => {
        const next = [...liveItems()];
        next.splice(to, 0, ...next.splice(from, 1));
        keys.current.splice(to, 0, ...keys.current.splice(from, 1));
        listItems.move(address, from, to, () => setValue(next));
      }}
    />
  );
}

const heldList = (held: unknown): unknown[] =>
  Array.isArray(held) ? held : [];
