import { useKeyboardOpen } from '@tinacms/ui/hooks/use-keyboard-open';
import { useTier } from '@tinacms/ui/hooks/use-tier';
import { cn } from '@tinacms/ui/lib/utils';
import * as React from 'react';

type FixedToolbarProps = {
  layout?: 'framed' | 'body';
  children: React.ReactNode;
};

const scrollParent = (element: HTMLElement) => {
  for (
    let parent = element.parentElement;
    parent;
    parent = parent.parentElement
  ) {
    if (/auto|scroll/.test(getComputedStyle(parent).overflowY)) return parent;
  }
  return null;
};

function useStuck(
  sentinel: React.RefObject<HTMLDivElement | null>,
  on: boolean
) {
  const [stuck, setStuck] = React.useState(false);
  React.useEffect(() => {
    const target = sentinel.current;
    if (!on || !target || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        const top = entry.rootBounds?.top ?? 0;
        setStuck(!entry.isIntersecting && entry.boundingClientRect.top < top);
      },
      { root: scrollParent(target), rootMargin: '-8px 0px 0px 0px' }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [sentinel, on]);
  return on && stuck;
}

const editorHasFocus = (box: HTMLElement | null | undefined) => {
  const active = document.activeElement;
  return (
    !!box &&
    active instanceof HTMLElement &&
    active.isContentEditable &&
    box.contains(active)
  );
};

function useEditorFocus(box: HTMLElement | null | undefined) {
  return React.useSyncExternalStore(
    (notify) => {
      document.addEventListener('focusin', notify);
      document.addEventListener('focusout', notify);
      return () => {
        document.removeEventListener('focusin', notify);
        document.removeEventListener('focusout', notify);
      };
    },
    () => editorHasFocus(box),
    () => false
  );
}

function useKeyboardInset(on: boolean) {
  const [inset, setInset] = React.useState(0);
  React.useEffect(() => {
    const viewport = window.visualViewport;
    if (!on || !viewport) return;
    const update = () =>
      setInset(
        Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop)
      );
    update();
    viewport.addEventListener('resize', update);
    viewport.addEventListener('scroll', update);
    return () => {
      viewport.removeEventListener('resize', update);
      viewport.removeEventListener('scroll', update);
    };
  }, [on]);
  return inset;
}

/**
 * Where the formatting toolbar sits. Flat at the top of the box in the `framed` layout. In
 * the `body` layout it sticks 8px under the top of the form's scroll area and lifts into a
 * card once stuck, and on a phone it rides on top of the keyboard while the editor has focus.
 */
export function FixedToolbar({
  layout = 'framed',
  children,
}: FixedToolbarProps) {
  const body = layout === 'body';
  const sentinel = React.useRef<HTMLDivElement>(null);
  const shell = React.useRef<HTMLDivElement>(null);
  const [box, setBox] = React.useState<HTMLElement | null>(null);
  const [height, setHeight] = React.useState(0);
  const tier = useTier();
  const keyboardOpen = useKeyboardOpen();
  const editorFocused = useEditorFocus(box);
  const lifted = body && tier === 'phone' && keyboardOpen && editorFocused;
  const stuck = useStuck(sentinel, body);
  const inset = useKeyboardInset(lifted);

  React.useLayoutEffect(() => {
    setBox(sentinel.current?.parentElement ?? null);
  }, []);

  React.useLayoutEffect(() => {
    if (!lifted && shell.current) setHeight(shell.current.offsetHeight);
  });

  return (
    <>
      {body ? (
        <div
          ref={sentinel}
          aria-hidden
          data-slot='toolbar-sentinel'
          className='pointer-events-none absolute inset-x-0 top-0 h-px'
        />
      ) : null}
      {lifted ? <div aria-hidden style={{ height }} /> : null}
      <div
        ref={shell}
        data-slot='toolbar-shell'
        data-stuck={stuck || lifted ? '' : undefined}
        data-lifted={lifted ? '' : undefined}
        style={lifted ? { bottom: inset } : undefined}
        className={cn(
          'z-30 w-full bg-background p-1',
          body
            ? 'sticky top-2 rounded-t-sm border-b border-border transition-[margin,box-shadow] data-stuck:mx-1.5 data-stuck:w-[calc(100%-0.75rem)] data-stuck:rounded-md data-stuck:border data-stuck:border-border data-stuck:shadow-md'
            : 'relative rounded-t-sm border-b border-border',
          lifted && 'fixed inset-x-0 mx-0! w-full! rounded-none!'
        )}
      >
        {children}
      </div>
    </>
  );
}
