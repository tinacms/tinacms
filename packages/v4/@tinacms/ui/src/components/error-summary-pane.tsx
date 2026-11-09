import { cva } from 'class-variance-authority';
import {
  type ComponentProps,
  Fragment,
  type KeyboardEvent,
  type RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { Badge } from '@tinacms/ui/components/badge';
import { foldPath } from '@tinacms/ui/components/breadcrumb';
import { Button } from '@tinacms/ui/components/button';
import { Icon } from '@tinacms/ui/components/icon';
import { Kbd } from '@tinacms/ui/components/kbd';
import { cn } from '@tinacms/ui/lib/utils';

/** One invalid field in the list, in document order. */
type ErrorSummaryItem = {
  /** A stable field path, such as `seo.metaTitle`. Go to the field by it, not by the row’s place in the list. */
  id: string;
  /**
   * The field’s name, such as “Meta title”. A long name wraps to two lines, then ends in an ellipsis, with the full
   * name in the row’s name and, while it is cut short, its tooltip.
   */
  label: string;
  /**
   * Where the field sits, outermost first, such as `["Feature grid", "Feature 3"]`. A top-level field gives its form
   * section. It keeps to one line: past three steps it folds its middle, as the Field trail does, to the first step
   * and the last two (“Comparison › … › Card 3 › Call to action”), and a long step ends in an ellipsis. The full
   * location is in the row’s name and, while it is cut short, its tooltip.
   */
  trail?: string[];
  /** What to do, from the field’s rule, such as “Enter a meta title.” It wraps in full. */
  message: string;
};

type ErrorSummaryStatus = 'list' | 'success';
type ErrorSummaryLayout = 'floating' | 'docked' | 'overlay';

/**
 * The narrowest window a pinned pane docks on, 1400 CSS pixels: the `--error-pane-dock-width` token as a number, for
 * code that needs one. The pane reads the token itself; a hidden check keeps the two equal.
 */
const TINA_ERROR_PANE_DOCK_WIDTH = 1400;

/** The Resolve words for the Save button: “Resolve 1 error”, “Resolve 3 errors”, up to “Resolve 99+ errors”. */
function tinaResolveLabel(count: number) {
  return `Resolve ${count > 99 ? '99+' : count} ${count === 1 ? 'error' : 'errors'}`;
}

/*
 * Floating and overlay sit over the preview, 12px in from the edges of the box the host gives them (the area between
 * the top bar and the status bar, `position: relative`). Docked is an ordinary flex item beside the preview, so the
 * preview narrows by its 360px.
 */
const tinaErrorSummaryPaneVariants = cva(
  'box-border flex w-90 max-w-full flex-col overflow-hidden bg-card font-sans text-foreground',
  {
    variants: {
      layout: {
        floating:
          'absolute inset-y-3 right-3 z-20 rounded-md border border-border shadow-dialog',
        overlay:
          'absolute inset-y-3 right-3 z-20 rounded-md border border-border shadow-dialog',
        docked:
          'relative h-full flex-none rounded-none border-0 border-l border-border shadow-none',
      },
    },
    defaultVariants: { layout: 'floating' },
  }
);

const rowVariants = cva(
  'group/row box-border flex w-full cursor-pointer items-start gap-3 rounded-sm border-0 bg-transparent p-3 text-left font-sans text-inherit transition-colors hover:bg-muted focus:outline-none focus-visible:bg-muted focus-visible:shadow-focus-inset active:bg-border data-[look=hover]:bg-muted',
  {
    variants: {
      selected: {
        true: 'bg-row-current inset-ring inset-ring-border',
        false: '',
      },
    },
    defaultVariants: { selected: false },
  }
);

/** A duration token, such as `--dur-slide-in`, in milliseconds. */
function readDuration(el: Element, token: string, fallback: number) {
  const raw = getComputedStyle(el).getPropertyValue(token).trim();
  const value = Number.parseFloat(raw);
  if (Number.isNaN(value)) return fallback;
  return raw.endsWith('ms') ? value : value * 1000;
}

function readToken(el: Element, token: string, fallback: string) {
  return getComputedStyle(el).getPropertyValue(token).trim() || fallback;
}

function reducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
  );
}

/**
 * Moves run on the Web Animations API, so they read the motion tokens and keep their own timing with reduced motion
 * (a fade over `--dur-reduced`), which the shell's reduced-motion rule would otherwise cut to nothing.
 */
function play(
  el: HTMLElement,
  frames: Keyframe[],
  duration: number,
  easing: string,
  done?: () => void
) {
  if (typeof el.animate !== 'function') {
    done?.();
    return undefined;
  }
  const animation = el.animate(frames, { duration, easing, fill: 'both' });
  if (done) animation.addEventListener('finish', done);
  return animation;
}

/** `(min-width: 87.5rem)`, from the `--error-pane-dock-width` token on `:root`. Null without a window or the stylesheet. */
function dockQuery() {
  if (typeof window === 'undefined' || !window.matchMedia) return null;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue('--error-pane-dock-width')
    .trim();
  return value ? `(min-width: ${value})` : null;
}

/** Whether the window is `--error-pane-dock-width` or wider, followed live as it resizes. Without a query, wide. */
function useWideWindow(enabled: boolean) {
  const [wide, setWide] = useState(() => {
    const query = dockQuery();
    return query ? window.matchMedia(query).matches : true;
  });
  useEffect(() => {
    const query = enabled ? dockQuery() : null;
    if (!query) return;
    const media = window.matchMedia(query);
    const update = () => setWide(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [enabled]);
  return wide;
}

/** A deep location keeps its first step and its last two, as the Field trail folds: "Comparison › … › Card 3 › Call to action". */
function shortTrail(trail: string[]) {
  return foldPath(trail).shown.map((step) => step ?? '…');
}

/**
 * Gives an element `text` as its tooltip (`title`) while it, or one of its parts, is cut short, so pointing at it
 * reads it in full. `folded` says it is always cut short, as a folded location is.
 */
function useFullTitle<T extends HTMLElement>(text: string, folded = false) {
  const ref = useRef<T>(null);
  const [cut, setCut] = useState(folded);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () =>
      setCut(
        folded ||
          [el, ...el.children].some(
            (part) =>
              part.scrollWidth > part.clientWidth ||
              part.scrollHeight > part.clientHeight
          )
      );
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
    // Measured after every drawing, as new words can cut it short without changing its size.
  });
  return { ref, title: cut ? text : undefined };
}

type ErrorRowProps = {
  error: ErrorSummaryItem;
  selected: boolean;
  stillHover: boolean;
  onSelect?: (error: ErrorSummaryItem) => void;
};

/*
 * Hover and keyboard focus change colours only: the fill, and the trailing "Go to field ›" fading in. The trailing
 * slot always holds both "Viewing" and "Go to field ›", one over the other, so it is as wide on every row in every
 * state and nothing in the row rewraps or moves.
 */
function ErrorRow({ error, selected, stillHover, onSelect }: ErrorRowProps) {
  const trail = error.trail ?? [];
  const where = trail.join(' › ');
  const steps = shortTrail(trail);
  const folded = steps.length < trail.length;
  const label = useFullTitle<HTMLSpanElement>(error.label);
  const location = useFullTitle<HTMLSpanElement>(where, folded);
  const name = `${error.label}${where ? `, in ${where}` : ''}. ${error.message}`;
  return (
    <button
      type='button'
      data-error-row=''
      data-look={stillHover ? 'hover' : undefined}
      aria-current={selected ? 'true' : undefined}
      aria-label={name}
      onClick={() => onSelect?.(error)}
      className={rowVariants({ selected })}
    >
      <span className='flex min-w-0 flex-auto flex-col gap-0.5'>
        <span
          ref={label.ref}
          title={label.title}
          className={cn(
            'line-clamp-2 text-base leading-title wrap-break-word text-foreground',
            selected ? 'font-semibold' : 'font-medium'
          )}
        >
          {error.label}
        </span>
        {where ? (
          <span
            ref={location.ref}
            title={location.title}
            data-slot='error-location'
            className='flex min-w-0 overflow-hidden text-xs leading-control whitespace-nowrap text-muted-foreground'
          >
            {steps.map((step, i) => (
              <Fragment key={i}>
                {i > 0 ? (
                  <span aria-hidden='true' className='flex-none px-1'>
                    ›
                  </span>
                ) : null}
                <span
                  className={cn(
                    'min-w-0 truncate',
                    folded && i === 1 && 'flex-none'
                  )}
                >
                  {step}
                </span>
              </Fragment>
            ))}
          </span>
        ) : null}
        <span className='mt-1 flex items-start gap-1.5 text-sm leading-control text-destructive'>
          <Icon glyph='error' size={14} className='mt-0.5' />
          <span className='min-w-0 wrap-break-word'>{error.message}</span>
        </span>
      </span>
      <span
        aria-hidden='true'
        className='grid flex-none self-center text-xs leading-control font-medium'
      >
        <span
          className={cn(
            'col-start-1 row-start-1 inline-flex items-center justify-end gap-1 text-muted-foreground',
            !selected && 'opacity-0'
          )}
        >
          <Icon glyph='eye' size={14} />
          Viewing
        </span>
        <span
          className={cn(
            'col-start-1 row-start-1 inline-flex items-center justify-end gap-1 text-foreground opacity-0 transition-opacity',
            !selected &&
              'group-hover/row:opacity-100 group-focus-visible/row:opacity-100 group-data-[look=hover]/row:opacity-100'
          )}
        >
          Go to field
          <Icon glyph='chevron-right' size={14} />
        </span>
      </span>
    </button>
  );
}

/** A row that was fixed: it collapses and fades, then goes. Out of the tab order and hidden from screen readers. */
function LeavingRow({
  error,
  onGone,
}: {
  error: ErrorSummaryItem;
  onGone: (id: string) => void;
}) {
  const ref = useRef<HTMLLIElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = reducedMotion();
    const frames: Keyframe[] = reduced
      ? [{ opacity: 1 }, { opacity: 0 }]
      : [
          { opacity: 1, height: `${el.offsetHeight}px` },
          { opacity: 0, height: '0px' },
        ];
    const animation = play(
      el,
      frames,
      reduced
        ? readDuration(el, '--dur-reduced', 100)
        : readDuration(el, '--dur-collapse', 160),
      readToken(el, '--ease', 'ease-out'),
      () => onGone(error.id)
    );
    return () => animation?.cancel();
  }, [error.id, onGone]);
  return (
    <li ref={ref} aria-hidden='true' inert className='overflow-hidden'>
      <ErrorRow error={error} selected={false} stillHover={false} />
    </li>
  );
}

type TinaErrorSummaryPaneProps = Omit<
  ComponentProps<'aside'>,
  'children' | 'onSelect'
> & {
  /**
   * The invalid fields the last Save found, in document order. The header chip counts them. A long list scrolls inside
   * the pane; the header and the subline stay put.
   */
  errors: ErrorSummaryItem[];
  /** Shown, or tucked away. A tucked pane stays in the page, hidden, so Resolve’s `aria-controls` still finds it. */
  open?: boolean;
  /**
   * The selected row, the one last gone to: a light fill with a 1px inset ring, a semibold name and the eye with
   * “Viewing”. It carries `aria-current`.
   */
  selectedId?: string;
  /**
   * Pinned: docks beside the preview on a wide window (full height, no radius or shadow, a line on its left only), or
   * floats over it on a narrower window, with a subline that says why it floats. Pin then reads “Pinned” and carries
   * `aria-pressed`.
   */
  pinned?: boolean;
  /**
   * The window is wide enough to dock: `--error-pane-dock-width` (1400px) or wider. Left out, the pane follows the
   * window itself, live. Set it to draw one layout whatever the window, as the stories do.
   */
  wide?: boolean;
  /**
   * `list` (default), or `success`: “All fixed.” over a timer bar that empties over `--dur-hold-success`, then calls
   * `onSuccessEnd`. The timer waits while the pane is pointed at or holds focus.
   */
  status?: ErrorSummaryStatus;
  /** A row was pressed (click, Enter or Space), with its item: go to that field. The pane stays open. */
  onSelect?: (error: ErrorSummaryItem) => void;
  /** Pin or Pinned was pressed, with the new setting. */
  onPin?: (pinned: boolean) => void;
  /** Close, or Esc inside the pane: set `open` to false and hand focus back to Resolve. */
  onClose?: () => void;
  /** The success timer bar has emptied: tuck the pane and return to Save. */
  onSuccessEnd?: () => void;
  /** When the pane opens, focus moves to its first row. Set it when Resolve or the edge tab opens a tucked pane. */
  autoFocusRow?: boolean;
  /**
   * Draws the hover look on that row, as in a still picture of it: a flat muted fill and “Go to field ›”, no shadow.
   * Hover and keyboard focus draw it live; keyboard focus adds the focus ring, and a press a darker fill. Each changes
   * the row’s colours only, and keeps its size and layout. For stories and screenshots: the admin leaves it out.
   */
  stillHoverId?: string;
  /**
   * Success: the timer bar stands still and full, and `onSuccessEnd` waits, as in a still picture of it. For stories
   * and screenshots: the admin leaves it out.
   */
  stillSuccess?: boolean;
  /**
   * Words for screen readers to hear politely, such as “Meta title fixed. 1 error left.” or “All fixed. You’re ready
   * to save.” Pass new words to have them read. The pane keeps them in a status region beside it that stays in the
   * page while it is tucked away, so keep the pane drawn, tucked, until they have been read. Left out, there is no
   * region and the announcements are the host’s.
   */
  announcement?: string;
};

/**
 * The error summary pane: the invalid fields that block Save, in document order, so the editor can go to each one.
 * An `aside` named “Errors” and its count, with no focus trap; it sits after Save in the tab order (Pin, Close, then
 * the rows). Esc inside it calls `onClose`, unless something inside took Esc first.
 *
 * It draws each state. The host decides when it opens, what it lists, the selected row and the words it announces
 * (`announcement`), and the pane reads them out. It slides in when `open` turns on (a pane first drawn open shows at
 * once) and out when it turns off, and a fixed row collapses and fades; with reduced motion, each is a fade over
 * `--dur-reduced`.
 */
function TinaErrorSummaryPane({
  errors,
  open = true,
  selectedId,
  pinned = false,
  wide,
  status = 'list',
  onSelect,
  onPin,
  onClose,
  onSuccessEnd,
  autoFocusRow = false,
  stillHoverId,
  stillSuccess = false,
  announcement,
  id = 'error-pane',
  className,
  onKeyDown,
  ...props
}: TinaErrorSummaryPaneProps) {
  const windowWide = useWideWindow(wide === undefined);
  const isWide = wide ?? windowWide;
  const layout: ErrorSummaryLayout = pinned
    ? isWide
      ? 'docked'
      : 'overlay'
    : 'floating';
  const success = status === 'success';
  const count = success ? 0 : errors.length;
  const titleId = `${id}-title`;

  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(open);
  const wasOpen = useRef(open);

  // Slide in when `open` turns on, out when it turns off; the pane is hidden only once it has slid out.
  useLayoutEffect(() => {
    const el = ref.current;
    if (wasOpen.current === open || !el) {
      wasOpen.current = open;
      return;
    }
    wasOpen.current = open;
    const reduced = reducedMotion();
    const away =
      layout === 'docked'
        ? 'translateX(100%)'
        : 'translateX(calc(100% + 0.75rem))';
    const frames: Keyframe[] = reduced
      ? [{ opacity: 0 }, { opacity: 1 }]
      : [
          { opacity: 0, transform: away },
          { opacity: 1, transform: 'translateX(0)' },
        ];
    if (open) {
      setShown(true);
      const animation = play(
        el,
        frames,
        reduced
          ? readDuration(el, '--dur-reduced', 100)
          : readDuration(el, '--dur-slide-in', 240),
        readToken(el, '--ease', 'ease-out')
      );
      return () => animation?.cancel();
    }
    const animation = play(
      el,
      [...frames].reverse(),
      reduced
        ? readDuration(el, '--dur-reduced', 100)
        : readDuration(el, '--dur-slide-out', 200),
      readToken(el, '--ease-exit', 'ease-in'),
      () => setShown(false)
    );
    return () => animation?.cancel();
  }, [open, layout]);

  useEffect(() => {
    if (!open || !shown || !autoFocusRow) return;
    // No scroll: the pane may still be sliding in from outside its box, which would scroll the box to meet it.
    ref.current
      ?.querySelector<HTMLElement>('[data-error-row]')
      ?.focus({ preventScroll: true });
  }, [open, shown, autoFocusRow]);

  // Fixed rows stay a moment to collapse, at the place they had.
  const [leaving, setLeaving] = useState<
    { error: ErrorSummaryItem; at: number }[]
  >([]);
  const previous = useRef(errors);
  useLayoutEffect(() => {
    const before = previous.current;
    previous.current = errors;
    if (success) return;
    const now = new Set(errors.map((error) => error.id));
    const gone = before.flatMap((error, at) =>
      now.has(error.id) ? [] : [{ error, at }]
    );
    if (gone.length)
      setLeaving((list) => [
        ...list.filter((l) => !now.has(l.error.id)),
        ...gone,
      ]);
  }, [errors, success]);
  const removeLeaving = useCallback((gone: string) => {
    setLeaving((list) => list.filter((l) => l.error.id !== gone));
  }, []);

  const rows: { error: ErrorSummaryItem; leaving: boolean }[] = errors.map(
    (error) => ({ error, leaving: false })
  );
  for (const l of [...leaving].sort((a, b) => a.at - b.at)) {
    if (!rows.some((row) => row.error.id === l.error.id)) {
      rows.splice(Math.min(l.at, rows.length), 0, {
        error: l.error,
        leaving: true,
      });
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || event.key !== 'Escape' || !onClose) return;
    event.preventDefault();
    event.stopPropagation();
    onClose();
  };

  const pane = (
    <aside
      ref={ref}
      id={id}
      aria-labelledby={titleId}
      hidden={!shown}
      data-slot='error-summary-pane'
      data-layout={layout}
      data-status={status}
      className={cn(tinaErrorSummaryPaneVariants({ layout }), className)}
      onKeyDown={handleKeyDown}
      {...props}
    >
      <header className='flex flex-none items-center gap-2 border-b border-border py-3.5 pr-3 pl-5'>
        <h2
          id={titleId}
          className='m-0 inline-flex items-center gap-2 font-heading text-md leading-title font-semibold text-foreground'
        >
          Errors
          <Badge kind='count' of='errors' count={count} />
        </h2>
        <span className='flex-auto' />
        <Button
          variant='ghost'
          size='compact'
          icon='pin'
          aria-pressed={pinned}
          onClick={() => onPin?.(!pinned)}
          className={cn('px-2.5', pinned && 'bg-muted [&_svg]:fill-current')}
        >
          {pinned ? 'Pinned' : 'Pin'}
        </Button>
        <Button
          variant='icon'
          size='compact'
          icon='close'
          aria-label='Close errors'
          onClick={() => onClose?.()}
        />
      </header>
      {success ? (
        <SuccessFace still={stillSuccess} onEnd={onSuccessEnd} pane={ref} />
      ) : (
        <>
          <div className='flex flex-none items-start justify-between gap-3 px-5 pt-3 pb-1'>
            <p className='m-0 text-sm leading-control text-muted-foreground'>
              {layout === 'overlay'
                ? 'Pinned. It docks beside the preview on a wider window.'
                : 'Fix these to save.'}
            </p>
            <span className='inline-flex flex-none items-center gap-1.5 text-xs leading-control text-muted-foreground'>
              <Kbd size='sm'>Esc</Kbd>
              <span className='sr-only'>Escape</span>
              to hide
            </span>
          </div>
          <ul
            role='list'
            className='m-0 flex min-h-0 flex-auto list-none flex-col gap-0.5 overflow-y-auto px-2 py-1.5'
          >
            {rows.map(({ error, leaving: isLeaving }) =>
              isLeaving ? (
                <LeavingRow
                  key={error.id}
                  error={error}
                  onGone={removeLeaving}
                />
              ) : (
                <li key={error.id}>
                  <ErrorRow
                    error={error}
                    selected={error.id === selectedId}
                    stillHover={error.id === stillHoverId}
                    onSelect={onSelect}
                  />
                </li>
              )
            )}
          </ul>
        </>
      )}
    </aside>
  );
  if (announcement === undefined) return pane;
  return (
    <>
      {pane}
      <span
        role='status'
        aria-live='polite'
        aria-atomic='true'
        className='sr-only'
      >
        {announcement}
      </span>
    </>
  );
}

/** “All fixed.”: a check in a green circle, and a timer bar along the bottom edge that empties over the hold. */
function SuccessFace({
  still,
  onEnd,
  pane,
}: {
  still: boolean;
  onEnd?: () => void;
  pane: RefObject<HTMLElement | null>;
}) {
  const bar = useRef<HTMLSpanElement>(null);
  const end = useRef(onEnd);
  end.current = onEnd;
  useEffect(() => {
    const el = bar.current;
    const host = pane.current;
    if (still || !el) return;
    const animation = play(
      el,
      [{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }],
      readDuration(el, '--dur-hold-success', 1500),
      'linear',
      () => end.current?.()
    );
    if (!animation || !host) return;
    // The hold waits while the editor points at or works inside the pane.
    const pause = () => animation.pause();
    const resume = () => {
      if (!host.matches(':hover') && !host.contains(document.activeElement))
        animation.play();
    };
    // Focus moving between two controls in the pane leaves it for a moment; look once it has landed.
    const resumeAfterFocus = () => requestAnimationFrame(resume);
    host.addEventListener('pointerenter', pause);
    host.addEventListener('focusin', pause);
    host.addEventListener('pointerleave', resume);
    host.addEventListener('focusout', resumeAfterFocus);
    return () => {
      animation.cancel();
      host.removeEventListener('pointerenter', pause);
      host.removeEventListener('focusin', pause);
      host.removeEventListener('pointerleave', resume);
      host.removeEventListener('focusout', resumeAfterFocus);
    };
  }, [still, pane]);
  return (
    <div className='relative flex min-h-0 flex-auto flex-col items-center justify-center gap-3 px-8 pb-20 text-center'>
      <span
        aria-hidden='true'
        className='inline-flex size-12 flex-none items-center justify-center rounded-full bg-status-published-subtle text-status-published'
      >
        <Icon glyph='check' size={20} />
      </span>
      <div className='flex flex-col gap-1'>
        <p className='m-0 font-heading text-md leading-title font-semibold text-foreground'>
          All fixed.
        </p>
        <p className='m-0 text-base leading-control text-muted-foreground'>
          You’re ready to save.
        </p>
      </div>
      <span
        aria-hidden='true'
        className='absolute inset-x-0 bottom-0 h-0.75 bg-muted'
      >
        <span
          ref={bar}
          data-slot='success-timer'
          className='block h-full origin-left bg-status-published'
        />
      </span>
    </div>
  );
}

type TinaErrorEdgeTabProps = Omit<ComponentProps<'button'>, 'children'> & {
  /** How many errors remain, in its chip and its name (“Show errors, 2”), up to 99+. */
  count: number;
  /** The tab was pressed: open the pane with `autoFocusRow`, so focus lands on the first row. */
  onOpen?: () => void;
  /** Shows at once, without sliding in: when the editor opens already tucked, and in a still picture of it. */
  still?: boolean;
};

/**
 * The tab on the right edge while the pane is tucked away and errors remain: the count chip, “Errors” set vertically
 * and a left chevron. It sits `--edge-tab-top` down the box the host gives it (`position: relative`), and slides in
 * 8px as it fades in, unless `still`.
 */
function TinaErrorEdgeTab({
  count,
  onOpen,
  still = false,
  className,
  onClick,
  'aria-controls': controls = 'error-pane',
  ...props
}: TinaErrorEdgeTabProps) {
  const ref = useRef<HTMLButtonElement>(null);
  // Only its first drawing can slide in, so `still` is read once.
  const calm = useRef(still);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || calm.current) return;
    const reduced = reducedMotion();
    const animation = play(
      el,
      reduced
        ? [{ opacity: 0 }, { opacity: 1 }]
        : [
            { opacity: 0, transform: 'translateX(0.5rem)' },
            { opacity: 1, transform: 'translateX(0)' },
          ],
      reduced
        ? readDuration(el, '--dur-reduced', 100)
        : readDuration(el, '--dur-appear', 150),
      readToken(el, '--ease', 'ease-out')
    );
    return () => animation?.cancel();
  }, []);
  return (
    <button
      ref={ref}
      type='button'
      aria-label={`Show errors, ${count > 99 ? '99+' : count}`}
      aria-controls={controls}
      aria-expanded='false'
      data-slot='error-edge-tab'
      onClick={(event) => {
        onClick?.(event);
        onOpen?.();
      }}
      className={cn(
        'absolute top-(--edge-tab-top) right-0 z-20 box-border flex h-37 w-10 cursor-pointer flex-col items-center justify-center gap-3 rounded-l-md border border-r-0 border-border bg-card py-3.5 font-sans text-foreground shadow-popover transition-colors hover:bg-muted focus:outline-none focus-visible:shadow-focus-ring',
        className
      )}
      {...props}
    >
      <Badge kind='count' of='errors' count={count} srLabel='' />
      <span className='rotate-180 text-base leading-none font-semibold [writing-mode:vertical-rl]'>
        Errors
      </span>
      <Icon glyph='chevron-left' size={16} className='text-muted-foreground' />
    </button>
  );
}

type TinaErrorSuccessBubbleProps = Omit<ComponentProps<'div'>, 'children'> & {
  /** It has faded away after its hold: remove it. */
  onDone?: () => void;
  /**
   * Shows at once and stays, without fading in or away, as in a still picture of it. For stories and screenshots: the
   * admin leaves it out.
   */
  still?: boolean;
};

/**
 * The small card above Save when the last error is fixed while the pane is tucked away: a check and “All fixed.
 * You’re ready to save.” It fades in, holds for `--dur-hold-bubble` and fades out. The host places it 8px above Save
 * and announces its words, through the tucked pane’s `announcement` or its own live region.
 */
function TinaErrorSuccessBubble({
  onDone,
  still = false,
  className,
  ...props
}: TinaErrorSuccessBubbleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const done = useRef(onDone);
  done.current = onDone;
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (still) return;
    const reduced = reducedMotion();
    const appear = reduced
      ? readDuration(el, '--dur-reduced', 100)
      : readDuration(el, '--dur-appear', 150);
    const hold = readDuration(el, '--dur-hold-bubble', 2500);
    const leave = reduced
      ? readDuration(el, '--dur-reduced', 100)
      : readDuration(el, '--dur-slide-out', 200);
    const total = appear + hold + leave;
    const animation = play(
      el,
      [
        { opacity: 0, offset: 0 },
        { opacity: 1, offset: appear / total },
        { opacity: 1, offset: (appear + hold) / total },
        { opacity: 0, offset: 1 },
      ],
      total,
      'linear',
      () => done.current?.()
    );
    return () => animation?.cancel();
  }, [still]);
  return (
    <div
      ref={ref}
      data-slot='error-success-bubble'
      className={cn(
        'box-border inline-flex items-center gap-2.5 rounded-sm border border-border bg-card px-3.5 py-2.5 font-sans text-sm leading-control whitespace-nowrap text-foreground shadow-popover',
        className
      )}
      {...props}
    >
      <Icon glyph='check' size={16} className='text-status-published' />
      All fixed. You’re ready to save.
    </div>
  );
}

export type {
  ErrorSummaryItem as TinaErrorSummaryItem,
  ErrorSummaryLayout as TinaErrorSummaryLayout,
  ErrorSummaryStatus as TinaErrorSummaryStatus,
  TinaErrorEdgeTabProps,
  TinaErrorSuccessBubbleProps,
  TinaErrorSummaryPaneProps,
};
export {
  TINA_ERROR_PANE_DOCK_WIDTH,
  TinaErrorEdgeTab,
  TinaErrorSuccessBubble,
  TinaErrorSummaryPane,
  tinaErrorSummaryPaneVariants,
  tinaResolveLabel,
};
