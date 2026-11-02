import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@tinacms/ui/components/dialog';
import { useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  useFieldAddress,
  useFieldFrame,
  useFieldValue,
  useFormId,
  useMediaSlice,
} from '../../../editor';
import { useFormStore } from '../../../form/form-store';
import { MediaBrowser } from '../../media-manager/media-browser';
import { ImageGalleryView } from './image-gallery.view';

type PickTarget = { kind: 'append' } | { kind: 'replace'; index: number };

let galleryKeyCount = 0;
const nextGalleryKey = (): string => `image-item-${galleryKeyCount++}`;

export function ImageGallery() {
  const address = useFieldAddress();
  const frame = useFieldFrame();
  const media = useMediaSlice();
  const formId = useFormId();
  const active = useFormStore((state) => state.active);
  const { getValues } = useFormContext();
  const [value, setValue] = useFieldValue<unknown[] | undefined>(address);
  const items = value ?? [];
  const keys = useRef<string[]>([]);
  if (keys.current.length !== items.length) {
    keys.current = items.map(nextGalleryKey);
  }
  const target = useRef<PickTarget>({ kind: 'append' });
  const opener = useRef<HTMLElement | null>(null);
  const [picking, setPicking] = useState(false);
  const [focusRequest, setFocusRequest] = useState<{ index: number }>();

  useEffect(() => {
    if (active?.formId !== formId || !active.address.startsWith(`${address}.`))
      return;
    const index = Number(active.address.slice(address.length + 1));
    if (Number.isInteger(index)) setFocusRequest({ index });
  }, [active, formId, address]);

  const liveItems = (): unknown[] => getValues(address) ?? [];

  const open = (next: PickTarget, from: HTMLElement) => {
    target.current = next;
    opener.current = from;
    setPicking(true);
  };

  const pick = (path: string) => {
    const current = target.current;
    if (current.kind === 'append') {
      keys.current = [...keys.current, nextGalleryKey()];
      setValue([...liveItems(), path]);
    } else {
      setValue(
        liveItems().map((item, index) =>
          index === current.index ? path : item
        )
      );
    }
    setPicking(false);
  };

  return (
    <>
      <ImageGalleryView
        {...frame}
        items={items.map((value, index) => ({
          key: keys.current[index] ?? String(index),
          value,
        }))}
        resolveUrl={media.resolveUrl}
        focusRequest={focusRequest}
        onAdd={(from) => open({ kind: 'append' }, from)}
        onReplace={(index, from) => open({ kind: 'replace', index }, from)}
        onRemove={(index) => {
          keys.current = keys.current.filter(
            (_, position) => position !== index
          );
          setValue(liveItems().filter((_, position) => position !== index));
        }}
        onMove={(from, to) => {
          const next = [...liveItems()];
          next.splice(to, 0, ...next.splice(from, 1));
          keys.current.splice(to, 0, ...keys.current.splice(from, 1));
          setValue(next);
        }}
      />
      <Dialog open={picking} onOpenChange={setPicking}>
        <DialogContent
          finalFocus={opener}
          className='flex h-[80vh] flex-col gap-0 p-0 max-w-5xl'
        >
          <DialogHeader className='border-b px-4 py-3'>
            <DialogTitle>Choose an image</DialogTitle>
          </DialogHeader>
          <MediaBrowser
            mode='pick'
            accept='image'
            onSelect={(item) => pick(item.path)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
