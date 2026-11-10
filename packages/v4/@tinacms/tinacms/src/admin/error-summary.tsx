import {
  TinaErrorEdgeTab,
  TinaErrorSuccessBubble,
  TinaErrorSummaryPane,
  type TinaErrorSummaryItem,
} from '@tinacms/ui/components/error-summary-pane';
import {
  use,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useFormContext } from 'react-hook-form';
import { useStore } from 'zustand';
import { toFieldAddress } from '../core/field/address';
import { FormScopeContext } from '../editor/context';
import { failingLeaves, inDocumentOrder } from '../editor/field-errors';
import { fieldsAlong, REMOVED } from '../editor/form-view-state';
import { useFormErrors, useFormStore } from '../form/form-store';
import { useNarrow } from './use-narrow';

const PIN_KEY = 'tina.errorPane.pinned';
const HOVER_DWELL_MS = 300;
const ERROR_PANE_ID = 'error-pane';

const readPinned = (): boolean => {
  try {
    return localStorage.getItem(PIN_KEY) === 'true';
  } catch {
    return false;
  }
};

const writePinned = (pinned: boolean) => {
  try {
    localStorage.setItem(PIN_KEY, String(pinned));
  } catch {
    // Storage can be blocked; the pin then lasts for the session only.
  }
};

const resolveButton = () =>
  document.querySelector<HTMLElement>('[data-resolve]');

const useScope = () => {
  const scope = use(FormScopeContext);
  if (!scope) throw new Error('The error summary needs a form scope');
  return scope;
};

interface Row extends TinaErrorSummaryItem {
  address: string;
}

function useErrorRows(): Row[] {
  const scope = useScope();
  const { getValues } = useFormContext();
  const errors = useFormErrors(scope.formId);
  const blocked = useStore(scope.view, (state) => state.errorSummary.blocked);
  return useMemo(() => {
    const live = blocked.filter((entry) => !entry.address.endsWith(REMOVED));
    return inDocumentOrder(live, scope.collection.fields, getValues).map(
      (entry) => {
        const steps = fieldsAlong(
          entry.address,
          scope.collection.fields,
          getValues
        );
        const field = steps.at(-1);
        const message = errors[toFieldAddress(entry.address)]?.[0];
        return {
          id: entry.key,
          address: entry.address,
          label: field?.label ?? entry.address,
          trail: steps.slice(0, -1).map((step) => step.label),
          message: message?.trim() || 'Check this field.',
        };
      }
    );
  }, [blocked, errors, scope.collection.fields, getValues]);
}

function useGoTo() {
  const scope = useScope();
  const narrow = useNarrow();
  return (key: string) => {
    const address = scope.view.getState().goTo(key);
    if (!address) return;
    useFormStore.getState().setActive(scope.formId, toFieldAddress(address));
    // Below lg the pane covers the form, so it clears the way for the field.
    if (narrow) scope.view.getState().tuckPane();
  };
}

export function useErrorSummary() {
  const scope = useScope();
  const { getValues } = useFormContext();
  const rows = useErrorRows();
  const goTo = useGoTo();
  const summary = useStore(scope.view, (state) => state.errorSummary);
  const blocked = summary.blocked.length > 0;

  const block = (): boolean => {
    const form = useFormStore.getState().forms[scope.formId];
    const errors = form?.status === 'edited' ? form.errors : {};
    const failing = Object.keys(errors);
    const leaves = failingLeaves(failing).map((address) => ({ address }));
    if (leaves.length === 0) return false;
    const ordered = inDocumentOrder(leaves, scope.collection.fields, getValues);
    scope.view.getState().block(
      ordered.map((leaf) => leaf.address),
      failing.filter(
        (address) => !leaves.some((leaf) => leaf.address === address)
      )
    );
    return true;
  };

  const resolve = () => {
    const view = scope.view.getState();
    if (!view.errorSummary.paneOpen) {
      view.openPane(true);
      return;
    }
    const { current, resumeAt } = view.errorSummary;
    const at = rows.findIndex((row) => row.id === current);
    let next: Row | undefined;
    if (current !== null && at >= 0) next = rows[(at + 1) % rows.length];
    else if (resumeAt !== null) next = rows[resumeAt] ?? rows[0];
    else next = rows[0];
    if (next) goTo(next.id);
  };

  return {
    blocked,
    count: rows.length,
    paneOpen: summary.paneOpen,
    block,
    resolve,
  };
}

const blockedWords = (count: number) => {
  const errors = `${count} ${count === 1 ? 'error' : 'errors'}`;
  return `Can't save. ${errors}. Error summary pane opened. Save is now Resolve ${errors}.`;
};

// The region empties first, so identical words are read again.
function BlockedAnnouncement({ count }: { count: number }) {
  const scope = useScope();
  const blockedSaves = useStore(scope.view, (state) => state.blockedSaves);
  const latest = useRef(count);
  latest.current = count;
  const [words, setWords] = useState('');
  useEffect(() => {
    if (blockedSaves === 0) return;
    setWords('');
    const frame = requestAnimationFrame(() =>
      setWords(blockedWords(latest.current))
    );
    return () => cancelAnimationFrame(frame);
  }, [blockedSaves]);
  return (
    <span
      aria-live='assertive'
      aria-atomic='true'
      data-slot='error-blocked-announcement'
      className='sr-only'
    >
      {words}
    </span>
  );
}

function useFollowFixes(rows: readonly Row[]) {
  const scope = useScope();
  const errors = useFormErrors(scope.formId);
  const { getValues } = useFormContext();
  const latest = useRef(rows);
  latest.current = rows;
  useEffect(() => {
    const view = scope.view.getState();
    if (view.errorSummary.blocked.length === 0) return;
    const { current } = view.errorSummary;
    const index = latest.current.findIndex((row) => row.id === current);
    view.fix(
      new Set(Object.keys(errors)),
      (address) =>
        fieldsAlong(address, scope.collection.fields, getValues).at(-1)
          ?.label ?? address,
      index >= 0 ? index : null
    );
  }, [errors, scope, getValues]);
}

function useTuckOutside(active: boolean, tuck: () => void) {
  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) tuck();
    };
    const inPreview = (target: EventTarget | null) =>
      target instanceof Element &&
      target.closest('[data-preview-slot]') !== null;
    const onPointer = (event: PointerEvent) => {
      if (inPreview(event.target)) tuck();
    };
    // A click inside the preview iframe never reaches this page, but the page loses focus to it.
    const onBlur = () => {
      if (inPreview(document.activeElement)) tuck();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    window.addEventListener('blur', onBlur);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
      window.removeEventListener('blur', onBlur);
    };
  }, [active, tuck]);
}

function EdgeHoverZone({ onDwell }: { onDwell: () => void }) {
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <div
      aria-hidden='true'
      data-slot='error-edge-hover'
      className='absolute inset-y-0 right-0 z-40 w-2'
      onPointerEnter={() => {
        timer.current = setTimeout(onDwell, HOVER_DWELL_MS);
      }}
      onPointerLeave={() => clearTimeout(timer.current)}
    />
  );
}

// The pane stays in the page while idle, so `aria-controls` and the live regions always exist.
export function DocumentErrorPane() {
  if (!use(FormScopeContext)) return null;
  return <ErrorPaneHost />;
}

function ErrorPaneHost() {
  const scope = useScope();
  const rows = useErrorRows();
  const goTo = useGoTo();
  const summary = useStore(scope.view, (state) => state.errorSummary);
  const [pinned, setPinned] = useState(readPinned);
  useFollowFixes(rows);

  const { blocked, paneOpen, current, done, focusRow, announcement } = summary;
  const listed = blocked.length > 0;
  const open = paneOpen && (listed || done === 'pane');

  const tuck = () => {
    const view = scope.view.getState();
    if (!view.errorSummary.paneOpen) return;
    const pane = document.getElementById(ERROR_PANE_ID);
    const hadFocus = pane?.contains(document.activeElement) === true;
    view.tuckPane();
    if (hadFocus) resolveButton()?.focus();
  };

  useTuckOutside(open && !pinned && listed, tuck);

  // The rows vanish with "All fixed", so a focus that sat in one falls to the page.
  useLayoutEffect(() => {
    if (done !== 'pane') return;
    if (document.activeElement === document.body) resolveButton()?.focus();
  }, [done]);

  return (
    <>
      <BlockedAnnouncement count={rows.length} />
      <span
        aria-live='polite'
        aria-atomic='true'
        data-slot='error-announcement'
        className='sr-only'
      >
        {announcement}
      </span>
      <TinaErrorSummaryPane
        id={ERROR_PANE_ID}
        errors={rows}
        open={open}
        selectedId={current ?? undefined}
        pinned={pinned}
        status={done === 'pane' ? 'success' : 'list'}
        autoFocusRow={focusRow}
        className='z-40 data-[layout=docked]:order-1 max-lg:w-[min(22.5rem,calc(100vw-1.5rem))]'
        onSelect={(row) => goTo(row.id)}
        onPin={(next) => {
          setPinned(next);
          writePinned(next);
        }}
        onClose={tuck}
        onSuccessEnd={() => {
          const pane = document.getElementById(ERROR_PANE_ID);
          const hadFocus = pane?.contains(document.activeElement) === true;
          scope.view.getState().endDone();
          if (hadFocus) resolveButton()?.focus();
        }}
      />
      {listed && !paneOpen ? (
        <>
          <TinaErrorEdgeTab
            count={rows.length}
            className='z-40'
            onOpen={() => scope.view.getState().openPane(true)}
          />
          <EdgeHoverZone
            onDwell={() => scope.view.getState().openPane(false)}
          />
        </>
      ) : null}
    </>
  );
}

export function ErrorSuccessBubble() {
  const scope = useScope();
  const done = useStore(scope.view, (state) => state.errorSummary.done);
  if (done !== 'button') return null;
  return (
    <TinaErrorSuccessBubble
      className='absolute right-4 bottom-full mb-2'
      onDone={() => scope.view.getState().endDone()}
    />
  );
}
