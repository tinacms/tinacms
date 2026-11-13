import type { DeclaredDocument } from '../preview/protocol';

export const NOTHING_TO_EDIT_DELAY_MS = 300;

export interface FollowContext {
  /** Whether the current route shows the preview. */
  showing: boolean;
  /** Whether the route is Nothing to edit. */
  onPage: boolean;
}

export interface Follower {
  declared: () => readonly DeclaredDocument[];
  main: () => string | null;
  update: (
    documents: DeclaredDocument[],
    url: string | undefined,
    context: FollowContext
  ) => void;
  /** The frame's route stopped or started showing the preview. */
  setShowing: (showing: boolean) => void;
  dispose: () => void;
}

const collapse = (documents: DeclaredDocument[]): DeclaredDocument[] => {
  const byPath = new Map<string, DeclaredDocument>();
  for (const { path, shared } of documents) {
    const held = byPath.get(path);
    byPath.set(path, {
      path,
      ...(held?.shared !== false && shared === true && { shared: true }),
    });
  }
  return [...byPath.values()];
};

// The first non-shared document, kept for as long as the page still declares it.
const stickyMain = (
  declared: DeclaredDocument[],
  current: string | null
): string | null => {
  if (current && declared.some((d) => d.path === current && !d.shared)) {
    return current;
  }
  return declared.find((d) => !d.shared)?.path ?? null;
};

/**
 * Follows the page the preview shows. A visit is a run of declarations with the
 * same url; the first visit after the frame mounts or shows again is the
 * baseline and never moves the form.
 */
export function createFollower(actions: {
  open: (path: string) => void;
  nothingToEdit: () => void;
}): Follower {
  let declared: DeclaredDocument[] = [];
  let main: string | null = null;
  let url: string | undefined;
  let started = false;
  let baseline = true;
  let openedMain: string | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const cancel = () => {
    clearTimeout(timer);
    timer = undefined;
  };

  return {
    declared: () => declared,
    main: () => main,
    update: (documents, nextUrl, { showing, onPage }) => {
      declared = collapse(documents);
      if (!started) {
        started = true;
        url = nextUrl;
      } else if (nextUrl !== undefined && nextUrl !== url) {
        url = nextUrl;
        baseline = false;
        openedMain = null;
      }
      main = stickyMain(declared, main);
      cancel();
      if (!showing) return;
      if (onPage) {
        if (main) actions.open(main);
        return;
      }
      if (baseline) return;
      if (main) {
        if (main !== openedMain) {
          openedMain = main;
          actions.open(main);
        }
        return;
      }
      if (openedMain === null) {
        timer = setTimeout(() => {
          timer = undefined;
          if (main === null && openedMain === null) actions.nothingToEdit();
        }, NOTHING_TO_EDIT_DELAY_MS);
      }
    },
    setShowing: (showing) => {
      cancel();
      if (showing) baseline = true;
    },
    dispose: cancel,
  };
}
