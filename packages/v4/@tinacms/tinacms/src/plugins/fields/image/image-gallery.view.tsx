import {
  FieldWrapper,
  type FieldWrapperProps,
} from '@tinacms/ui/components/field-wrapper';
import { Icon } from '@tinacms/ui/components/icon';
import { cn } from '@tinacms/ui/lib/utils';
import {
  type KeyboardEvent,
  type PointerEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { mediaNameOf } from '../../media-manager/media-types';
import { MISSING_IMAGE_WARNING } from './image-field.view';
import { ImageTile, MoveHandle, type ResolveImageUrl } from './image-tile';

export interface ImageGalleryItem {
  key: string;
  value: unknown;
  missing?: boolean;
}

export interface ImageGalleryViewProps
  extends Pick<
    FieldWrapperProps,
    'label' | 'labelId' | 'errors' | 'help' | 'helpId' | 'warnings' | 'required'
  > {
  items: ImageGalleryItem[];
  resolveUrl: ResolveImageUrl;
  onAdd: (opener: HTMLElement) => void;
  onReplace: (index: number, opener: HTMLElement) => void;
  onRemove: (index: number) => void;
  onMove: (from: number, to: number) => void;
  focusRequest?: { index: number };
  disabled?: boolean;
  readOnly?: boolean;
}

const DRAG_THRESHOLD_PX = 4;

type Focus =
  | { kind: 'handle' | 'replace'; key: string }
  | { kind: 'add' }
  | null;

const itemName = (value: unknown): { path: string | null; label: string } =>
  typeof value === 'string' && value !== ''
    ? { path: value, label: mediaNameOf(value) }
    : {
        path: null,
        label:
          value == null || value === '' ? 'Empty image' : 'Not a media path',
      };

export function ImageGalleryView({
  label,
  labelId,
  errors,
  help,
  helpId,
  warnings = [],
  required,
  items,
  resolveUrl,
  onAdd,
  onReplace,
  onRemove,
  onMove,
  focusRequest,
  disabled,
  readOnly,
}: ImageGalleryViewProps) {
  const editable = !disabled && !readOnly;
  const gridRef = useRef<HTMLDivElement>(null);
  const replaceEls = useRef(new Map<string, HTMLButtonElement>());
  const handleEls = useRef(new Map<string, HTMLButtonElement>());
  const addEl = useRef<HTMLButtonElement>(null);
  const pendingFocus = useRef<Focus>(null);
  const press = useRef<{
    index: number;
    x: number;
    y: number;
    active: boolean;
  } | null>(null);
  const [drag, setDrag] = useState<{ from: number; over: number } | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [missingKeys, setMissingKeys] = useState<ReadonlySet<string>>(
    new Set()
  );

  useLayoutEffect(() => {
    const target = pendingFocus.current;
    if (!target) return;
    pendingFocus.current = null;
    if (target.kind === 'add') addEl.current?.focus();
    else if (target.kind === 'handle')
      handleEls.current.get(target.key)?.focus();
    else replaceEls.current.get(target.key)?.focus();
  });

  useEffect(() => {
    if (!focusRequest) return;
    const item = items[focusRequest.index];
    if (item) replaceEls.current.get(item.key)?.focus();
  }, [focusRequest]);

  useEffect(() => {
    if (!drag) return;
    const cancel = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      press.current = null;
      setDrag(null);
    };
    window.addEventListener('keydown', cancel);
    return () => window.removeEventListener('keydown', cancel);
  }, [drag]);

  const setMissing = (key: string, missing: boolean) =>
    setMissingKeys((previous) => {
      if (previous.has(key) === missing) return previous;
      const next = new Set(previous);
      if (missing) next.add(key);
      else next.delete(key);
      return next;
    });

  const moveTo = (from: number, to: number, focusKey: string) => {
    const item = items[from];
    if (!item || to < 0 || to >= items.length || to === from) return;
    pendingFocus.current = { kind: 'handle', key: focusKey };
    setAnnouncement(
      `Moved ${itemName(item.value).label} to position ${to + 1} of ${items.length}`
    );
    onMove(from, to);
  };

  const remove = (index: number) => {
    const next = items[index + 1] ?? items[index - 1];
    pendingFocus.current = next
      ? { kind: 'replace', key: next.key }
      : { kind: 'add' };
    onRemove(index);
  };

  const keyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
    key: string
  ) => {
    const step =
      event.key === 'ArrowLeft' || event.key === 'ArrowUp'
        ? -1
        : event.key === 'ArrowRight' || event.key === 'ArrowDown'
          ? 1
          : 0;
    if (step === 0) return;
    event.preventDefault();
    moveTo(index, index + step, key);
  };

  const indexAt = (x: number, y: number): number => {
    const tiles =
      gridRef.current?.querySelectorAll<HTMLElement>('[data-tile-index]');
    for (const tile of tiles ?? []) {
      const box = tile.getBoundingClientRect();
      if (x >= box.left && x <= box.right && y >= box.top && y <= box.bottom) {
        return Number(tile.dataset.tileIndex);
      }
    }
    return -1;
  };

  const pointerDown = (event: PointerEvent<HTMLElement>, index: number) => {
    if (!editable || event.button !== 0) return;
    const control =
      event.target instanceof Element && event.target.closest('button');
    if (control && !control.closest('[data-handle]')) return;
    press.current = {
      index,
      x: event.clientX,
      y: event.clientY,
      active: false,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const pointerMove = (event: PointerEvent<HTMLElement>) => {
    const current = press.current;
    if (!current) return;
    if (!current.active) {
      const travelled = Math.hypot(
        event.clientX - current.x,
        event.clientY - current.y
      );
      if (travelled < DRAG_THRESHOLD_PX) return;
      current.active = true;
    }
    setDrag({
      from: current.index,
      over: indexAt(event.clientX, event.clientY),
    });
  };

  const pointerUp = (event: PointerEvent<HTMLElement>) => {
    const current = press.current;
    press.current = null;
    if (!current?.active) return;
    const over = indexAt(event.clientX, event.clientY);
    setDrag(null);
    const item = items[current.index];
    if (item && over >= 0) moveTo(current.index, over, item.key);
  };

  const missingWarnings = items.some(
    (item) => item.missing || missingKeys.has(item.key)
  )
    ? [MISSING_IMAGE_WARNING]
    : [];

  return (
    <FieldWrapper
      label={label}
      labelId={labelId}
      required={required}
      help={help}
      helpId={helpId}
      errors={errors}
      warnings={[...warnings, ...missingWarnings]}
      disabled={disabled}
    >
      <div role='group' aria-labelledby={labelId}>
        {items.length === 0 && !editable ? (
          <p className='m-0 text-sm text-muted-foreground'>No images.</p>
        ) : (
          <div ref={gridRef} className='grid max-w-120 grid-cols-3 gap-2'>
            {items.map((item, index) => {
              const { path, label: name } = itemName(item.value);
              return (
                <div
                  key={item.key}
                  data-tile-index={index}
                  className='min-w-0'
                  onPointerDown={(event) => pointerDown(event, index)}
                  onPointerMove={pointerMove}
                  onPointerUp={pointerUp}
                  onPointerCancel={() => {
                    press.current = null;
                    setDrag(null);
                  }}
                >
                  <ImageTile
                    path={path}
                    placeholder={name}
                    fallbackName={`Image ${index + 1}`}
                    resolveUrl={resolveUrl}
                    look='square'
                    inert={!editable}
                    missing={item.missing}
                    onMissingChange={(missing) => setMissing(item.key, missing)}
                    lifted={drag?.from === index}
                    dropTarget={
                      drag !== null &&
                      drag.over === index &&
                      drag.from !== index
                    }
                    replaceRef={(el) => {
                      if (el) replaceEls.current.set(item.key, el);
                      else replaceEls.current.delete(item.key);
                    }}
                    onReplace={
                      editable
                        ? () => {
                            const opener = replaceEls.current.get(item.key);
                            if (opener) onReplace(index, opener);
                          }
                        : undefined
                    }
                    onRemove={editable ? () => remove(index) : undefined}
                    handle={
                      editable ? (
                        <MoveHandle
                          label={`Move Image ${index + 1}: ${name}`}
                          ref={(el) => {
                            if (el) handleEls.current.set(item.key, el);
                            else handleEls.current.delete(item.key);
                          }}
                          onKeyDown={(event) => keyDown(event, index, item.key)}
                        />
                      ) : undefined
                    }
                  />
                </div>
              );
            })}
            {editable ? (
              <button
                ref={addEl}
                type='button'
                className={cn(
                  'flex aspect-square min-w-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-sm border border-dashed border-input text-sm text-muted-foreground transition outline-none hover:bg-muted focus-visible:shadow-focus-ring'
                )}
                onClick={(event) => onAdd(event.currentTarget)}
              >
                <Icon glyph='plus' size={20} />
                Add images
              </button>
            ) : null}
          </div>
        )}
        <div aria-live='polite' className='sr-only'>
          {announcement}
        </div>
      </div>
    </FieldWrapper>
  );
}
