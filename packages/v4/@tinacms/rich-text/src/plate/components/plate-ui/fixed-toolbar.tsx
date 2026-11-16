import { useKeyboardOpen } from '@tinacms/ui/hooks/use-keyboard-open';
import { useTier } from '@tinacms/ui/hooks/use-tier';
import { cn } from '@tinacms/ui/lib/utils';
import * as React from 'react';
import { useKeyboardInset } from '../../hooks/use-keyboard-inset';

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
    if (!on || !target) return;
    const root = scrollParent(target);
    const update = () => {
      const top = root ? root.getBoundingClientRect().top : 0;
      setStuck(target.getBoundingClientRect().top < top + 8);
    };
    update();
    const scroller = root ?? window;
    scroller.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      scroller.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [sentinel, on]);
  return on && stuck;
}

const focusIsOnToolbar = (shell: HTMLElement | null) => {
  const active = document.activeElement;
  return (
    !!active &&
    (!!shell?.contains(active) ||
      !!active.closest('[role="menu"], [role="dialog"]'))
  );
};

const editorHasFocus = (box: HTMLElement | null | undefined) => {
  const active = document.activeElement;
  return (
    !!box &&
    active instanceof HTMLElement &&
    active.isContentEditable &&
    box.contains(active)
  );
};

function useEditorFocus(
  box: HTMLElement | null | undefined,
  hasFocus: (box: HTMLElement | null) => boolean = editorHasFocus
) {
  return React.useSyncExternalStore(
    (notify) => {
      document.addEventListener('focusin', notify);
      document.addEventListener('focusout', notify);
      return () => {
        document.removeEventListener('focusin', notify);
        document.removeEventListener('focusout', notify);
      };
    },
    () => hasFocus(box ?? null),
    () => false
  );
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
  const wasLifted = React.useRef(false);
  const toolbarFocused = useEditorFocus(shell.current, focusIsOnToolbar);
  const phoneBody = body && tier === 'phone';
  const lifted =
    phoneBody &&
    ((keyboardOpen && editorFocused) || (wasLifted.current && toolbarFocused));
  wasLifted.current = lifted;
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
        onMouseDown={(event) => {
          if (
            phoneBody &&
            event.target instanceof Element &&
            event.target.closest('button')
          ) {
            event.preventDefault();
          }
        }}
        className={cn(
          'z-30 w-full bg-background p-1',
          body
            ? 'sticky top-2 rounded-t-sm border-b border-border transition-[margin,box-shadow] data-stuck:mx-1.5 data-stuck:w-[calc(100%-0.75rem)] data-stuck:rounded-md data-stuck:border data-stuck:border-border data-stuck:shadow-md'
            : 'relative rounded-t-sm border-b border-border',
          lifted && 'fixed inset-x-0 top-auto! mx-0! w-full! rounded-none!'
        )}
      >
        {children}
      </div>
    </>
  );
}
