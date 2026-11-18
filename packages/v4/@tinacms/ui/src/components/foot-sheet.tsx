import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import {
  type CSSProperties,
  createContext,
  type PointerEvent,
  type ReactNode,
  type RefObject,
  use,
  useRef,
  useSyncExternalStore,
} from 'react';

import { Button } from '@tinacms/ui/components/button';
import { useTier } from '@tinacms/ui/hooks/use-tier';
import { cn } from '@tinacms/ui/lib/utils';

/** What the popup of a dialog, confirm or sheet shares with its foot-sheet handle. */
const FootSheetRootContext = createContext({ keepOnDismiss: false });

const FootSheetRootProvider = FootSheetRootContext.Provider;

const TAP_SLOP = 6;
const DRAG_CLOSE_MAX = 80;
const SCRIM_STRIP = 48;

/**
 * The whole look of a popup as a foot sheet. The top room for the handle comes from the chrome
 * strip and the safe-area room from a transparent bottom border, so a caller's `p-0` keeps both.
 * `--sheet-gap` and `--sheet-px` are the space between children and at the sides; a caller
 * changes them there, not with `gap-*` or `px-*`, so the strip can cancel and span them.
 */
const footSheetClasses = (bodyScrolls: boolean) =>
  cn(
    'group/dialog fixed inset-x-0 bottom-0 z-50 m-0 flex h-auto max-h-[calc(100dvh-48px)] min-h-[50dvh] w-auto flex-col gap-(--sheet-gap) overflow-y-auto rounded-t-xl border-b-[length:env(safe-area-inset-bottom,0px)] border-transparent bg-popover px-(--sheet-px) pb-6 [--sheet-gap:--spacing(4)] [--sheet-px:--spacing(6)] font-sans text-base leading-control text-foreground shadow-dialog outline-none',
    bodyScrolls ? 'scroll-pt-28 scroll-pb-20 pt-0' : 'pt-9',
    'transition-[translate,opacity] duration-(--dur-slide-in) data-ending-style:translate-y-full data-ending-style:duration-(--dur-slide-out) data-ending-style:ease-exit data-starting-style:translate-y-full',
    'motion-reduce:data-ending-style:translate-y-0 motion-reduce:data-ending-style:opacity-0 motion-reduce:data-starting-style:translate-y-0 motion-reduce:data-starting-style:opacity-0'
  );

const footSheetScrimClasses =
  'max-md:duration-(--dur-slide-in) max-md:data-ending-style:duration-(--dur-slide-out)';

/** A header that stays under the chrome strip while a foot sheet's body scrolls. It never shrinks, and scrolls itself past 40dvh. */
const footSheetHeaderClasses =
  'group-data-[slot=foot-sheet]/dialog:sticky group-data-[slot=foot-sheet]/dialog:top-9 group-data-[slot=foot-sheet]/dialog:z-10 group-data-[slot=foot-sheet]/dialog:shrink-0 group-data-[slot=foot-sheet]/dialog:max-h-[40dvh] group-data-[slot=foot-sheet]/dialog:overflow-y-auto group-data-[slot=foot-sheet]/dialog:bg-popover';

/** A footer whose buttons share the row in equal parts on a phone. */
const footSheetFooterClasses =
  'max-md:sticky max-md:bottom-0 max-md:flex-nowrap max-md:bg-popover max-md:pt-3 max-md:*:flex-1 max-md:*:min-w-0';

type ViewportRide = { bottom: number; height: number } | null;

function subscribeViewport(notify: () => void) {
  const visual = window.visualViewport;
  visual?.addEventListener('resize', notify);
  visual?.addEventListener('scroll', notify);
  window.addEventListener('resize', notify);
  return () => {
    visual?.removeEventListener('resize', notify);
    visual?.removeEventListener('scroll', notify);
    window.removeEventListener('resize', notify);
  };
}

// A string, so useSyncExternalStore sees an equal snapshot as equal.
function viewportSnapshot() {
  const visual = window.visualViewport;
  if (!visual) return '';
  // Pinch zoom shrinks the visual viewport's height too; scaling it back leaves only a keyboard.
  const shrunk = window.innerHeight - visual.height * visual.scale;
  if (shrunk < 1) return '';
  const bottom = window.innerHeight - (visual.offsetTop + visual.height);
  return `${Math.max(0, bottom)}:${visual.height}`;
}

/**
 * Where the foot of a foot sheet sits while an on-screen keyboard has shrunk the visual
 * viewport, else null. Real keyboards leave `window.innerHeight` alone.
 */
function useViewportRide(enabled: boolean): ViewportRide {
  const snapshot = useSyncExternalStore(
    subscribeViewport,
    () => (enabled ? viewportSnapshot() : ''),
    () => ''
  );
  if (!snapshot) return null;
  const [bottom, height] = snapshot.split(':').map(Number);
  return { bottom, height };
}

/** Inline style that lifts a foot sheet's foot to the visual viewport's foot. */
function useFootSheetRide(enabled: boolean): CSSProperties | undefined {
  const ride = useViewportRide(enabled);
  if (!ride) return undefined;
  const room = Math.min(ride.height, window.innerHeight - SCRIM_STRIP);
  return {
    bottom: ride.bottom,
    maxHeight: room,
    minHeight: Math.min(window.innerHeight / 2, room),
  };
}

/** True while the sheet's own popup is still open. */
const stillOpen = (sheet: HTMLElement) =>
  sheet.isConnected &&
  sheet.hasAttribute('data-open') &&
  !sheet.hasAttribute('data-ending-style');

function springBack(sheet: HTMLElement) {
  sheet.style.transition = 'transform var(--dur-slide-out) var(--ease-exit)';
  sheet.style.transform = '';
  const clear = () => {
    sheet.style.transition = '';
    sheet.removeEventListener('transitionend', clear);
  };
  sheet.addEventListener('transitionend', clear);
}

type FootSheetHandleProps = {
  /** The close button this handle renders as. A dialog and an alert dialog differ. */
  close: (props: {
    className: string;
    'aria-label': string;
    'data-foot-sheet-chrome': string;
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
    onPointerDown: (event: PointerEvent<HTMLButtonElement>) => void;
    onPointerMove: (event: PointerEvent<HTMLButtonElement>) => void;
    onPointerUp: (event: PointerEvent<HTMLButtonElement>) => void;
    onPointerCancel: (event: PointerEvent<HTMLButtonElement>) => void;
    children: ReactNode;
  }) => ReactNode;
};

/**
 * The grab handle of a foot sheet: a button that closes the sheet by tap or by a drag down.
 * It closes through the root's own close button, so the caller hears `onOpenChange(false)`
 * once, as it does for ×. Under `keepOnDismiss`, or when the caller refuses, it springs back.
 */
function FootSheetHandle({ close }: FootSheetHandleProps) {
  const { keepOnDismiss } = use(FootSheetRootContext);
  const state = useRef<DragState | null>(null);

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    const sheet = event.currentTarget.closest<HTMLElement>(
      '[data-slot="foot-sheet"]'
    );
    if (!sheet || event.button > 0) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    sheet.style.transition = 'none';
    state.current = { startY: event.clientY, dy: 0, moved: 0, sheet };
  };

  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const drag = state.current;
    if (!drag) return;
    const dy = event.clientY - drag.startY;
    drag.moved = Math.max(drag.moved, Math.abs(dy));
    drag.dy = Math.max(0, dy);
    if (drag.moved >= TAP_SLOP) {
      drag.sheet.style.transform = `translateY(${drag.dy}px)`;
    }
  };

  const end = (event: PointerEvent<HTMLButtonElement>, cancelled: boolean) => {
    const drag = state.current;
    state.current = null;
    if (!drag) return;
    const button = event.currentTarget;
    const { sheet } = drag;
    if (drag.moved < TAP_SLOP && !cancelled) {
      // A tap: the click that follows closes, or springs back under keepOnDismiss.
      sheet.style.transition = '';
      sheet.style.transform = '';
      return;
    }
    // A drag: the click the browser fires after it must not close on its own.
    suppressNextClick.add(button);
    setTimeout(() => suppressNextClick.delete(button), 0);
    const far = Math.min(DRAG_CLOSE_MAX, sheet.offsetHeight / 4);
    if (!cancelled && !keepOnDismiss && drag.dy >= far) {
      dragClose.add(button);
      button.click();
      requestAnimationFrame(() => {
        if (stillOpen(sheet)) springBack(sheet);
      });
      return;
    }
    springBack(sheet);
  };

  return close({
    className:
      'absolute top-0 left-1/2 flex h-9 w-32 -translate-x-1/2 touch-none cursor-grab items-center justify-center border-0 bg-transparent p-0 outline-none after:block after:h-1.25 after:w-12 after:rounded-full after:bg-input focus-visible:after:bg-ring md:hidden',
    'aria-label': 'Close sheet',
    'data-foot-sheet-chrome': '',
    onClick: (event) => {
      if (dragClose.delete(event.currentTarget)) return;
      if (suppressNextClick.has(event.currentTarget)) {
        suppressNextClick.delete(event.currentTarget);
        (event as unknown as BaseUiEvent).preventBaseUIHandler();
        return;
      }
      const sheet = event.currentTarget.closest<HTMLElement>(
        '[data-slot="foot-sheet"]'
      );
      if (keepOnDismiss) {
        (event as unknown as BaseUiEvent).preventBaseUIHandler();
        return;
      }
      if (sheet) {
        requestAnimationFrame(() => {
          if (stillOpen(sheet)) springBack(sheet);
        });
      }
    },
    onPointerDown,
    onPointerMove,
    onPointerUp: (event) => end(event, false),
    onPointerCancel: (event) => end(event, true),
    children: null,
  });
}

type BaseUiEvent = { preventBaseUIHandler: () => void };

const suppressNextClick = new WeakSet<HTMLElement>();
const dragClose = new WeakSet<HTMLElement>();

type DragState = {
  startY: number;
  dy: number;
  moved: number;
  sheet: HTMLElement;
};

/** The × of a foot sheet: always shown on a phone, whatever `showCloseButton` says. */
function FootSheetCloseButton({
  Close,
  className,
}: {
  Close: typeof DialogPrimitive.Close;
  className?: string;
}) {
  return (
    <Close
      data-slot='dialog-close'
      data-foot-sheet-chrome=''
      render={
        <Button
          variant='icon'
          size='sm'
          icon='close'
          aria-label='Close'
          className={cn('absolute top-0.5 right-4', className)}
        />
      }
    />
  );
}

/**
 * Focus for a foot sheet that names none: the first control in its body or actions, never the
 * handle or ×; else the popup itself.
 */
function firstBodyFocus(popup: RefObject<HTMLElement | null>) {
  return () => {
    const el = popup.current;
    if (!el) return true;
    const first = [
      ...el.querySelectorAll<HTMLElement>(
        'input:not([type=hidden]), textarea, select, button, a[href], [tabindex]'
      ),
    ].find(
      (node) =>
        !node.hasAttribute('data-foot-sheet-chrome') &&
        !node.hasAttribute('disabled') &&
        node.getAttribute('tabindex') !== '-1'
    );
    return first ?? el;
  };
}

/** The space a menu, select or popover keeps from the screen's edge: 12px on a phone, Base UI's own below. */
function usePopupEdgePadding(): number | undefined {
  return useTier() === 'phone' ? 12 : undefined;
}

type FootSheetPopupOptions = {
  /** Whether the popup is a foot sheet right now (a phone, and a bottom sheet for `SheetContent`). */
  on: boolean;
  /** The root's own `Close` part: a dialog's or an alert dialog's. */
  Close: typeof DialogPrimitive.Close;
  /** The `data-slot` the popup keeps when it is not a foot sheet. */
  slot: string;
  /** The classes the popup keeps when it is not a foot sheet. */
  look: string;
  className?: DialogPrimitive.Popup.Props['className'];
  initialFocus?: DialogPrimitive.Popup.Props['initialFocus'];
  style?: DialogPrimitive.Popup.Props['style'];
  /** False when the popup does not scroll and its chrome stays absolute (the error sheet). */
  bodyScrolls?: boolean;
};

type FootSheetPopup = {
  popup: {
    ref: RefObject<HTMLDivElement | null>;
    'data-slot': string;
    className: (state: DialogPrimitive.Popup.State) => string;
    initialFocus: DialogPrimitive.Popup.Props['initialFocus'];
    style: (state: DialogPrimitive.Popup.State) => CSSProperties;
  };
  scrim: { forceRender?: boolean; 'data-slot'?: string; className?: string };
  chrome: ReactNode;
  ref: RefObject<HTMLDivElement | null>;
};

/**
 * Everything a popup needs to be a foot sheet: spread `popup` on its Popup and `scrim` on its
 * overlay, and render `chrome` last inside the popup. Off, `popup` and `scrim` carry the
 * caller's own props and `chrome` is null.
 */
function useFootSheetPopup({
  on,
  Close,
  slot,
  look,
  className,
  initialFocus,
  style,
  bodyScrolls = true,
}: FootSheetPopupOptions): FootSheetPopup {
  const ref = useRef<HTMLDivElement>(null);
  const ride = useFootSheetRide(on);
  const popup = {
    ref,
    'data-slot': on ? 'foot-sheet' : slot,
    className: (state: DialogPrimitive.Popup.State) =>
      cn(
        on ? footSheetClasses(bodyScrolls) : look,
        typeof className === 'function' ? className(state) : className
      ),
    initialFocus: initialFocus ?? (on ? firstBodyFocus(ref) : undefined),
    style: (state: DialogPrimitive.Popup.State): CSSProperties => ({
      ...(typeof style === 'function' ? style(state) : style),
      ...ride,
    }),
  };
  const scrim = on
    ? {
        forceRender: true,
        'data-slot': 'foot-sheet-scrim',
        className: footSheetScrimClasses,
      }
    : {};
  const buttons = (
    <>
      <FootSheetCloseButton Close={Close} />
      <FootSheetHandle
        close={(handle) => <Close {...handle} data-slot='foot-sheet-handle' />}
      />
    </>
  );
  const chrome = !on ? null : bodyScrolls ? (
    <div
      data-slot='foot-sheet-chrome'
      className='sticky top-0 z-20 order-first -mx-(--sheet-px) -mb-(--sheet-gap) h-9 flex-none bg-popover'
    >
      {buttons}
    </div>
  ) : (
    buttons
  );
  return { popup, scrim, chrome, ref };
}

export type { FootSheetHandleProps };
export {
  FootSheetRootProvider,
  footSheetFooterClasses,
  footSheetHeaderClasses,
  useFootSheetPopup,
  usePopupEdgePadding,
};
