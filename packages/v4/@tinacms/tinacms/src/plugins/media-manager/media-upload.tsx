import { Button } from '@tinacms/ui/components/button';
import { Icon } from '@tinacms/ui/components/icon';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@tinacms/ui/components/popover';
import { cn } from '@tinacms/ui/lib/utils';
import {
  CheckIcon,
  FileIcon,
  type LucideIcon,
  type LucideProps,
} from 'lucide-react';
import {
  type CSSProperties,
  type FocusEvent,
  type MouseEvent,
  type RefObject,
  forwardRef,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { UPLOAD_LIST_ATTR } from '../../editor/uploads/upload-list';
import type { UploadRow } from '../../editor/uploads/upload-view';
import { useUploadList, useUploadView } from '../../editor/uploads/use-uploads';

// One width for every look, so the button's edges never move when its words change.
const BUTTON_MIN_WIDTH = '11rem';

/** Reads the batch progress, 0 to 100, from `--upload-done` on the button that holds it. */
const UploadRing: LucideIcon = forwardRef<
  SVGSVGElement,
  Omit<LucideProps, 'ref'>
>(function UploadRing(
  {
    className,
    size: _size,
    strokeWidth: _weight,
    absoluteStrokeWidth: _absolute,
    color: _color,
    ...props
  },
  ref
) {
  return (
    <svg
      ref={ref}
      viewBox='0 0 16 16'
      fill='none'
      aria-hidden='true'
      {...props}
      className={cn('block size-4 flex-none -rotate-90', className)}
    >
      <circle className='stroke-border' cx='8' cy='8' r='6' strokeWidth='2' />
      <circle
        className='stroke-primary motion-safe:transition-[stroke-dashoffset]'
        cx='8'
        cy='8'
        r='6'
        strokeWidth='2'
        pathLength={100}
        strokeDasharray='100'
        style={{
          strokeDashoffset: 'calc((100 - var(--upload-done, 0)) * 1px)',
        }}
      />
    </svg>
  );
});

const DoneTick: LucideIcon = forwardRef<
  SVGSVGElement,
  Omit<LucideProps, 'ref'>
>(function DoneTick({ className, ...props }, ref) {
  return (
    <CheckIcon
      ref={ref}
      {...props}
      className={cn(className, 'text-status-published')}
    />
  );
});

const ringStyle = (percent: number, minWidth: string): CSSProperties => ({
  minWidth,
  ...{ '--upload-done': percent },
});

// A removed button fires no blur, so focus that loses its button goes to the list.
function useKeepFocus(
  root: RefObject<HTMLElement | null>,
  home: RefObject<HTMLElement | null>
) {
  const inside = useRef(false);
  useLayoutEffect(() => {
    if (!inside.current) return;
    const active = document.activeElement;
    if (active && active !== document.body && active.isConnected) return;
    if (home.current && root.current?.contains(home.current)) {
      home.current.focus({ preventScroll: true });
    } else {
      inside.current = false;
    }
  });
  return {
    onFocus: () => {
      inside.current = true;
    },
    onBlur: (event: FocusEvent) => {
      const next = event.relatedTarget;
      if (!(next instanceof Node && root.current?.contains(next))) {
        inside.current = false;
      }
    },
  };
}

function Thumb({ row }: { row: UploadRow }) {
  const [unreadable, setUnreadable] = useState(false);
  return (
    <span
      aria-hidden='true'
      className='flex h-7.5 w-10 flex-none items-center justify-center overflow-hidden rounded-xs bg-muted text-muted-foreground inset-ring inset-ring-border-subtle'
    >
      {row.preview && !unreadable ? (
        <img
          src={row.preview}
          alt=''
          className='size-full object-cover'
          onError={() => setUnreadable(true)}
        />
      ) : (
        <Icon glyph={FileIcon} size={16} />
      )}
    </span>
  );
}

const NAME_TAIL = 12;
const graphemes = new Intl.Segmenter(undefined, { granularity: 'grapheme' });

// The tail never shrinks, so a long name is cut in the middle and keeps its end.
const splitName = (name: string): { head: string; tail: string } => {
  const parts = Array.from(graphemes.segment(name), (part) => part.segment);
  if (parts.length <= NAME_TAIL) return { head: '', tail: name };
  return {
    head: parts.slice(0, -NAME_TAIL).join(''),
    tail: parts.slice(-NAME_TAIL).join(''),
  };
};

// A removed or replaced button puts another under the pointer, so the second
// click of a double click must not act. A key press has a count of 0.
const onFirstClick = (act: () => void) => (event: MouseEvent<HTMLElement>) => {
  if (event.detail <= 1) act();
};

// CSS cuts the start at a whole letter, which leaves an uneven gap before the
// end. The start is clipped at its edge here, and the ellipsis shows only when
// the whole name does not fit the row. The row's width is what is measured,
// not the start's own box: the ellipsis takes room from that box.
function RowName({ name }: { name: string }) {
  const { head, tail } = splitName(name);
  const room = useRef<HTMLSpanElement>(null);
  const start = useRef<HTMLSpanElement>(null);
  const end = useRef<HTMLSpanElement>(null);
  const [cut, setCut] = useState(false);
  useLayoutEffect(() => {
    const frame = room.current;
    if (!frame) return;
    // Layout widths only: the popover opens scaled, and a scale changes a
    // bounding box but not these.
    const measure = () => {
      const first = start.current;
      const whole = (first?.scrollWidth ?? 0) + (end.current?.offsetWidth ?? 0);
      setCut(first !== null && whole > frame.clientWidth + 1);
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [head, tail]);
  return (
    <span ref={room} className='flex min-w-0 font-medium text-foreground'>
      <span className='sr-only'>{name}</span>
      <span aria-hidden='true' title={name} className='flex min-w-0'>
        {head === '' ? null : (
          <span ref={start} className='min-w-0 overflow-hidden whitespace-pre'>
            {head}
          </span>
        )}
        {cut ? <span className='flex-none'>…</span> : null}
        <span ref={end} className='flex-none whitespace-pre'>
          {tail}
        </span>
      </span>
    </span>
  );
}

interface RowActions {
  onCancel: (id: string) => void;
  onRetry: (id: string) => void;
  onRemove: (id: string) => void;
}

function Row({
  row,
  onCancel,
  onRetry,
  onRemove,
}: { row: UploadRow } & RowActions) {
  return (
    <li className='relative flex shrink-0 items-center gap-2.5 overflow-hidden rounded-sm py-2 pr-1 pl-2.5'>
      <Thumb row={row} />
      <div className='flex min-w-0 flex-auto flex-col gap-0.5'>
        <RowName name={row.name} />
        <span
          className={cn(
            'text-xs text-pretty wrap-anywhere',
            row.kind === 'fail' && 'text-destructive'
          )}
        >
          {row.kind === 'ok' ? (
            <Icon
              glyph='check'
              size={14}
              className='mr-1 inline align-text-bottom text-status-published'
            />
          ) : null}
          {row.meta}
        </span>
      </div>
      {row.action === 'cancel' ? (
        <Button
          variant='ghost'
          size='sm'
          aria-label={`Cancel uploading ${row.name}`}
          className='flex-none'
          onClick={onFirstClick(() => onCancel(row.id))}
        >
          Cancel
        </Button>
      ) : null}
      {row.action === 'retry' ? (
        <Button
          variant='outline'
          size='sm'
          aria-label={`Retry uploading ${row.name}`}
          className='flex-none'
          onClick={onFirstClick(() => onRetry(row.id))}
        >
          Retry
        </Button>
      ) : null}
      {row.action === 'remove' ? (
        <Button
          variant='destructive'
          size='sm'
          aria-label={`Remove ${row.name}`}
          className='flex-none'
          onClick={onFirstClick(() => onRemove(row.id))}
        >
          Remove
        </Button>
      ) : null}
      {row.percent !== null ? (
        <progress
          aria-hidden='true'
          max={100}
          value={row.percent}
          className='absolute inset-x-0 bottom-0 block h-0.5 w-full appearance-none border-0 bg-transparent [&::-moz-progress-bar]:bg-primary [&::-webkit-progress-bar]:bg-transparent [&::-webkit-progress-value]:bg-primary motion-safe:[&::-webkit-progress-value]:transition-[width]'
        />
      ) : null}
    </li>
  );
}

export interface MediaUploadButtonProps {
  /** The file dialog's `accept`. */
  accept: string;
  /** Why files cannot be chosen now, in words. The list still opens. */
  holdReason?: string | null;
  size?: 'sm' | 'md';
  /** The files the editor picked. Never empty. */
  onPick: (files: File[]) => void;
}

/**
 * Media's Upload button with the upload list under it, for the pane and the
 * picker. Idle and done open the file dialog; running and failed open the list.
 */
export function MediaUploadButton({
  accept,
  holdReason = null,
  size = 'sm',
  onPick,
}: MediaUploadButtonProps) {
  const uploads = useUploadList();
  const view = useUploadView();
  const { rows, button: look } = view;
  const [wantOpen, setWantOpen] = useState(false);
  const open = wantOpen && rows.length > 0;
  const input = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const keep = useKeepFocus(popup, list);
  const labelId = useId();
  const reasonId = useId();
  const chooses = look.mode === 'idle' || look.mode === 'done';
  const held = holdReason !== null;

  useEffect(() => {
    if (!wantOpen || rows.length > 0) return;
    setWantOpen(false);
    trigger.current?.focus();
  }, [wantOpen, rows.length]);

  const shared = {
    ref: trigger,
    variant: 'ghost',
    size,
    'aria-describedby': held && chooses ? reasonId : undefined,
  } as const;

  const face =
    look.mode === 'run' ? (
      <Button
        {...shared}
        icon={UploadRing}
        style={ringStyle(look.percent, BUTTON_MIN_WIDTH)}
        className='justify-start'
      >
        {look.words}
      </Button>
    ) : look.mode === 'done' ? (
      <Button
        {...shared}
        icon={DoneTick}
        disabled={held}
        minWidth={BUTTON_MIN_WIDTH}
        className='justify-start'
      >
        {`${look.count} uploaded`}
      </Button>
    ) : look.mode === 'failed' ? (
      <Button
        {...shared}
        icon='upload'
        chip={look.count}
        chipSrLabel={`, ${look.count} couldn't upload`}
        minWidth={BUTTON_MIN_WIDTH}
        className='justify-start'
      >
        Upload
      </Button>
    ) : (
      <Button
        {...shared}
        icon='upload'
        disabled={held}
        minWidth={BUTTON_MIN_WIDTH}
        className='justify-start'
      >
        Upload
      </Button>
    );

  return (
    <>
      <input
        ref={input}
        type='file'
        multiple
        hidden
        tabIndex={-1}
        aria-label='Choose files to upload'
        accept={accept}
        onChange={(event) => {
          const files = [...(event.target.files ?? [])];
          event.target.value = '';
          if (files.length > 0) onPick(files);
        }}
      />
      {held && chooses ? (
        <span id={reasonId} className='sr-only'>
          {holdReason}
        </span>
      ) : null}
      <Popover
        open={open}
        onOpenChange={(next) => {
          if (next && chooses) {
            if (!held) input.current?.click();
            return;
          }
          if (next) uploads.markSeen();
          setWantOpen(next);
        }}
      >
        <PopoverTrigger render={face} />
        <PopoverContent
          ref={popup}
          align='end'
          aria-labelledby={labelId}
          initialFocus={list}
          onFocus={keep.onFocus}
          onBlur={keep.onBlur}
          {...{ [UPLOAD_LIST_ATTR]: '' }}
          className='w-90 gap-0 overflow-hidden p-1 text-sm text-muted-foreground'
        >
          <div id={labelId} className='px-2.5 py-1.5 text-xs'>
            Uploads
          </div>
          <ul
            ref={list}
            tabIndex={-1}
            aria-labelledby={labelId}
            className='m-0 flex max-h-72 min-h-0 list-none flex-col overflow-y-auto p-0 outline-none'
          >
            {rows.map((row) => (
              <Row
                key={row.id}
                row={row}
                onCancel={uploads.cancel}
                onRetry={uploads.retry}
                onRemove={uploads.remove}
              />
            ))}
          </ul>
        </PopoverContent>
      </Popover>
    </>
  );
}
