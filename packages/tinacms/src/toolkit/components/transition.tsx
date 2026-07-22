import React from 'react';

/**
 * Drop-in replacement for @headlessui/react's <Transition> / <TransitionChild>.
 *
 * We only ever used Headless UI for these two components plus a few primitives
 * Radix already gives us, and Headless UI v2 drags in the whole React Aria
 * stack (~50 MB installed) to do it.
 *
 * Same prop API as Headless UI: `show`, `appear`, `as`, and the
 * enter/enterFrom/enterTo/entered/leave/leaveFrom/leaveTo class strings.
 */

type Stage = 'start' | 'end' | 'settled';
type Direction = 'enter' | 'leave';

export interface TransitionClasses {
  enter?: string;
  enterFrom?: string;
  enterTo?: string;
  /** Held once the enter transition has landed, for as long as the element is shown. */
  entered?: string;
  leave?: string;
  leaveFrom?: string;
  leaveTo?: string;
}

interface TransitionState {
  direction: Direction;
  stage: Stage;
}

const TransitionContext = React.createContext<TransitionState | null>(null);

const classesFor = (
  { direction, stage }: TransitionState,
  c: TransitionClasses
) => {
  // Once the enter transition has landed we drop enter/enterFrom/enterTo and keep
  // only `entered`, matching Headless UI. Leaving them applied keeps a `transform`
  // on the node (e.g. `translate-x-0`), which makes it a containing block and
  // collapses absolutely-positioned children to zero size.
  if (direction === 'enter' && stage === 'settled') {
    return [c.entered].filter(Boolean).join(' ');
  }
  const base = direction === 'enter' ? c.enter : c.leave;
  const phase =
    direction === 'enter'
      ? stage === 'start'
        ? c.enterFrom
        : c.enterTo
      : stage === 'start'
        ? c.leaveFrom
        : c.leaveTo;
  return [base, phase].filter(Boolean).join(' ');
};

const waitForAnimations = (el: HTMLElement | null): Promise<void> => {
  if (!el?.getAnimations) {
    return Promise.resolve();
  }
  const animations = el
    .getAnimations({ subtree: true })
    .filter(
      (a) =>
        a.effect?.getComputedTiming().iterations !== Number.POSITIVE_INFINITY
    );
  if (animations.length === 0) {
    return Promise.resolve();
  }
  return Promise.allSettled(animations.map((a) => a.finished)).then(() => {});
};

export interface TransitionProps
  extends TransitionClasses,
    React.HTMLAttributes<HTMLDivElement> {
  show: boolean;
  appear?: boolean;
  /** Kept for API compatibility; every call site uses the default 'div'. */
  as?: 'div';
  children?: React.ReactNode;
}

export const Transition = ({
  show,
  appear = false,
  as: _as,
  enter,
  enterFrom,
  enterTo,
  entered,
  leave,
  leaveFrom,
  leaveTo,
  className,
  children,
  ...rest
}: TransitionProps) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = React.useState(show);
  const [state, setState] = React.useState<TransitionState>({
    direction: show ? 'enter' : 'leave',
    // Without `appear`, an initially-shown element starts settled (no animation).
    stage: show && !appear ? 'end' : 'start',
  });
  const first = React.useRef(true);

  React.useEffect(() => {
    // Skip the very first run unless `appear` asked for an entry animation.
    if (first.current) {
      first.current = false;
      if (!(show && appear)) {
        return;
      }
    }
    if (show) {
      setMounted(true);
      setState({ direction: 'enter', stage: 'start' });
    } else {
      setState({ direction: 'leave', stage: 'start' });
    }
  }, [show, appear]);

  // Advance start -> end on the next frame. The browser has to paint the
  // `*From` classes before we swap to `*To`, or there's nothing to tween.
  React.useEffect(() => {
    if (state.stage !== 'start') {
      return;
    }
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() =>
        setState((prev) => ({ ...prev, stage: 'end' }))
      );
    });
    return () => cancelAnimationFrame(raf);
  }, [state.stage, state.direction]);

  // Once the enter transition has finished, advance to `settled` so classesFor
  // drops enter/enterFrom/enterTo (and any lingering transform). Wait for the
  // animation to actually run first so we don't cut the entrance short.
  React.useEffect(() => {
    if (!mounted || state.direction !== 'enter' || state.stage !== 'end') {
      return;
    }
    let cancelled = false;
    const raf = requestAnimationFrame(() => {
      waitForAnimations(ref.current).then(() => {
        if (!cancelled) {
          setState((prev) =>
            prev.direction === 'enter' && prev.stage === 'end'
              ? { ...prev, stage: 'settled' }
              : prev
          );
        }
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [mounted, state.direction, state.stage]);

  // Only once the leave classes are actually painted do the transitions exist,
  // so this must run *after* commit — asking any earlier finds nothing running
  // and unmounts instantly, skipping the animation entirely.
  React.useEffect(() => {
    if (!mounted || state.direction !== 'leave' || state.stage !== 'end') {
      return;
    }
    let cancelled = false;
    const raf = requestAnimationFrame(() => {
      waitForAnimations(ref.current).then(() => {
        if (!cancelled) {
          setMounted(false);
        }
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [mounted, state.direction, state.stage]);

  if (!mounted) {
    return null;
  }

  const own = classesFor(state, {
    enter,
    enterFrom,
    enterTo,
    entered,
    leave,
    leaveFrom,
    leaveTo,
  });

  return (
    <TransitionContext.Provider value={state}>
      <div
        ref={ref}
        className={[className, own].filter(Boolean).join(' ')}
        {...rest}
      >
        {children}
      </div>
    </TransitionContext.Provider>
  );
};

export interface TransitionChildProps
  extends TransitionClasses,
    React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const TransitionChild = ({
  enter,
  enterFrom,
  enterTo,
  entered,
  leave,
  leaveFrom,
  leaveTo,
  className,
  children,
  ...rest
}: TransitionChildProps) => {
  const state = React.useContext(TransitionContext);
  // Outside a <Transition> there's nothing to coordinate with — render as-is.
  const own = state
    ? classesFor(state, {
        enter,
        enterFrom,
        enterTo,
        entered,
        leave,
        leaveFrom,
        leaveTo,
      })
    : '';

  return (
    <div className={[className, own].filter(Boolean).join(' ')} {...rest}>
      {children}
    </div>
  );
};
