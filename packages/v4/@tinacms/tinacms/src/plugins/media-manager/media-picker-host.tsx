import { useKeyboardOpen } from '@tinacms/ui/hooks/use-keyboard-open';
import { useTier } from '@tinacms/ui/hooks/use-tier';
import { cn } from '@tinacms/ui/lib/utils';
import {
  type CSSProperties,
  use,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { createPortal } from 'react-dom';
import { useStore } from 'zustand';
import { useCurrentBranch } from '../../editor/content-queries';
import { FormScopeContext } from '../../editor/context';
import type { FormViewStore } from '../../editor/form-view-state';
import { useFormStore } from '../../form/form-store';
import { UploadHost } from '../../editor/uploads/upload-host';
import { MediaPickerPanel } from './media-picker';

const PREVIEW_SLOT = '[data-preview-slot]';
const FORM_REGION = '[data-form-id]';
// How long after a form-driven close a new form column may take focus.
const REGION_FOCUS_MS = 3000;

const focusFormRegion = () => {
  const region = document.querySelector<HTMLElement>(FORM_REGION);
  region?.focus();
};
const POPOVER_WIDTH_PX = 400;
const INSET_PX = 12;
// Under this preview width the popover would squeeze the header, so it covers the page instead.
const MIN_REGION_PX = 440;
// The Top bar's and the Status bar's heights, which the admin's pickers keep clear.
const TOP_BAR_PX = 56;
const STATUS_BAR_PX = 28;

interface MediaPickerHostProps {
  /**
   * `TinaAdmin` renders the primary host over the preview. Any other host is a
   * fallback: it draws only when no primary host is mounted for its form.
   */
  primary?: boolean;
  /** The admin sets it while the picker's place is taken, so an open picker closes. */
  suspended?: boolean;
  /**
   * The Media pane is open. Opening it closes an open picker; a picker asked for while it is
   * open closes the pane through `onClosePane` and shows.
   */
  paneOpen?: boolean;
  onClosePane?: () => void;
}

/**
 * Draws the form's media picker. A field asks for it through `useMediaPicker()`
 * and never draws it. The first mounted host of a form draws; the admin's
 * primary host goes first, and `FormProvider`'s fallback covers a page with no admin.
 */
export function MediaPickerHost({
  primary = false,
  suspended = false,
  paneOpen = false,
  onClosePane,
}: MediaPickerHostProps) {
  const scope = use(FormScopeContext);
  if (!scope) return null;
  return (
    <ScopedHost
      view={scope.view}
      primary={primary}
      suspended={suspended}
      paneOpen={paneOpen}
      onClosePane={onClosePane}
    />
  );
}

function ScopedHost({
  view,
  primary,
  suspended,
  paneOpen,
  onClosePane,
}: {
  view: FormViewStore;
} & Omit<Required<MediaPickerHostProps>, 'onClosePane'> &
  Pick<MediaPickerHostProps, 'onClosePane'>) {
  const id = useId();
  useEffect(
    () => view.getState().claimPickerHost(id, primary),
    [view, id, primary]
  );
  const first = useStore(view, (state) => state.pickerHosts[0] === id);
  const open = useStore(view, (state) => state.picker !== null);

  useEffect(() => {
    if (suspended && open) view.getState().closePicker();
  }, [view, suspended, open]);

  useEffect(() => {
    if (paneOpen && open) view.getState().closePicker();
  }, [view, paneOpen]);
  useEffect(() => {
    if (open && paneOpen) onClosePane?.();
  }, [open]);

  return (
    <>
      {primary || !first ? null : <UploadHost />}
      {first && open && !suspended ? (
        <OpenPicker view={view} primary={primary} />
      ) : null}
    </>
  );
}

const subscribeViewport = (notify: () => void) => {
  const viewport = window.visualViewport;
  viewport?.addEventListener('resize', notify);
  viewport?.addEventListener('scroll', notify);
  window.addEventListener('resize', notify);
  return () => {
    viewport?.removeEventListener('resize', notify);
    viewport?.removeEventListener('scroll', notify);
    window.removeEventListener('resize', notify);
  };
};

const viewportHeight = () =>
  Math.round(window.visualViewport?.height ?? window.innerHeight);
const viewportTop = () => Math.round(window.visualViewport?.offsetTop ?? 0);

/** The visible part of the window, which the on-screen keyboard shrinks. */
function useVisibleArea(): { height: number; top: number } {
  const height = useSyncExternalStore(
    subscribeViewport,
    viewportHeight,
    () => 0
  );
  const top = useSyncExternalStore(subscribeViewport, viewportTop, () => 0);
  return { height, top };
}

function useCloseOnBranchChange(
  view: FormViewStore,
  close: (restoreFocus: boolean) => void
) {
  const branch = useCurrentBranch() ?? '';
  const opened = useRef(branch);
  useEffect(() => {
    if (opened.current === branch) return;
    opened.current = branch;
    close(true);
  }, [branch, view, close]);
}

interface Region {
  top: number;
  left: number;
  width: number;
  height: number;
}

/** The preview region's box in the window, kept current while the picker is open. */
function usePreviewRegion(enabled: boolean): Region | null {
  const [region, setRegion] = useState<Region | null>(null);
  useLayoutEffect(() => {
    const slot = enabled ? document.querySelector(PREVIEW_SLOT) : null;
    if (!slot) {
      setRegion(null);
      return;
    }
    const measure = () => {
      const { top, left, width, height } = slot.getBoundingClientRect();
      setRegion((last) =>
        last &&
        last.top === top &&
        last.left === left &&
        last.width === width &&
        last.height === height
          ? last
          : { top, left, width, height }
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(slot);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [enabled]);
  return region;
}

/** Makes everything else on the page inert while the picker covers the form. */
function useModal(root: HTMLElement | null, modal: boolean) {
  useEffect(() => {
    if (!modal || !root) return;
    const made: Element[] = [];
    for (const element of document.body.children) {
      if (element === root || element.hasAttribute('inert')) continue;
      element.setAttribute('inert', '');
      made.push(element);
    }
    return () => {
      for (const element of made) element.removeAttribute('inert');
    };
  }, [root, modal]);
}

const placeInRegion = (region: Region, maximised: boolean): CSSProperties => {
  const height = Math.max(0, region.height - 2 * INSET_PX);
  const maxWidth = Math.max(0, region.width - 2 * INSET_PX);
  const width = maximised ? maxWidth : Math.min(POPOVER_WIDTH_PX, maxWidth);
  return {
    top: region.top + INSET_PX,
    left: region.left + region.width - INSET_PX - width,
    width,
    height,
  };
};

function OpenPicker({
  view,
  primary,
}: {
  view: FormViewStore;
  primary: boolean;
}) {
  const request = useStore(view, (state) => state.picker);
  const formId = use(FormScopeContext)?.formId;
  const tier = useTier();
  const keyboard = useKeyboardOpen();
  const area = useVisibleArea();
  const [maximised, setMaximised] = useState(false);
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const [entered, setEntered] = useState(false);
  // `focus` is set by a close the user made. Left unset, the form closed the picker.
  const restore = useRef<{ opener: HTMLElement | null; focus?: boolean }>({
    opener: null,
  });

  const phone = tier === 'phone';
  const tabletMaximised = tier === 'tablet' && maximised;
  const region = usePreviewRegion(primary && !phone);
  const narrow = region !== null && region.width < MIN_REGION_PX;
  const covering = phone || tabletMaximised || narrow;

  // A cover that wins over a maximised picker leaves it restored when the preview widens again.
  useEffect(() => {
    if (narrow) setMaximised(false);
  }, [narrow]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useModal(root, covering);

  useEffect(() => {
    restore.current.opener = request?.opener ?? null;
  }, [request]);

  useEffect(
    () => () => {
      const { opener, focus } = restore.current;
      if (focus === false) return;
      if (opener?.isConnected) opener.focus();
      else {
        // The field is gone. Another field now at its address must not take focus from the active mark.
        const { active, setActive } = useFormStore.getState();
        if (active?.formId === formId) setActive(formId, null);
        focusFormRegion();
      }
      if (focus === undefined) view.getState().armRegionFocus(REGION_FOCUS_MS);
    },
    [view, formId]
  );

  const close = (restoreFocus: boolean) => {
    restore.current.focus = restoreFocus;
    view.getState().closePicker();
  };
  useCloseOnBranchChange(view, close);

  if (!request) return null;

  const topPx = primary ? TOP_BAR_PX : 0;
  const bottomPx = primary && !keyboard ? STATUS_BAR_PX : 0;
  const phoneStyle: CSSProperties = {
    top: topPx + area.top,
    height: Math.max(0, area.height - topPx - bottomPx),
  };
  let where: string;
  let style: CSSProperties | undefined;
  if (phone) {
    where = 'fixed z-40 inset-x-0';
    style = phoneStyle;
  } else if (covering) {
    where = cn(
      'fixed z-40 inset-x-0',
      primary ? 'top-14 bottom-7' : 'inset-y-0'
    );
  } else if (region) {
    where = 'fixed z-30 rounded-md';
    style = placeInRegion(region, maximised);
  } else if (maximised) {
    where = 'fixed z-40 inset-3 rounded-md';
  } else {
    where = 'fixed z-40 inset-y-0 right-0 w-100 max-w-full';
  }

  const panel = (
    <div
      ref={setRoot}
      data-slot='media-picker-host'
      className={cn(
        where,
        'overflow-hidden border bg-card shadow-lg transition-[translate,opacity] duration-(--dur) ease-(--ease) motion-reduce:transition-none',
        entered ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
      style={style}
    >
      <MediaPickerPanel
        request={request}
        maximised={maximised}
        onMaximise={
          phone || narrow ? undefined : () => setMaximised((on) => !on)
        }
        onClose={close}
      />
    </div>
  );

  return <>{createPortal(panel, document.body)}</>;
}
