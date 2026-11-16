export type LoadCondition = 'loading' | 'reloading' | 'failed' | undefined;

/** What the probe of an address found: a response, a refusal, or no answer within its timeout. */
export type ProbeResult = 'reached' | 'rejected' | 'timeout';

export const LOAD_CAP_MS = 30_000;

interface PreviewLoadDeps {
  probe: (url: string) => Promise<ProbeResult>;
  /** True when the frame's own location can be read: a real same-origin page, not the browser's error page. */
  frameReadable: () => boolean;
  onCondition: (condition: LoadCondition) => void;
  capMs?: number;
}

/**
 * The state of one admin-started load. The condition ends when the iframe's `load` and the probe
 * have both settled. A rejected probe is a failure. A timed-out probe is unknown: the machine
 * probes again once `load` arrives, and a second timeout counts as shown only when the frame is
 * readable. With no answer by the cap, the condition is `failed`; a later `load` re-checks it.
 *
 * The machine starts active, so a `load` that fires before the first `start` still counts.
 */
export function createPreviewLoad({
  probe,
  frameReadable,
  onCondition,
  capMs = LOAD_CAP_MS,
}: PreviewLoadDeps) {
  let token = 0;
  let active = true;
  let loaded = false;
  let capped = false;
  let url = '';
  let result: ProbeResult | 'pending' = 'pending';
  let second = false;
  let capTimer: ReturnType<typeof setTimeout> | null = null;

  const finish = (condition: LoadCondition) => {
    active = false;
    capped = false;
    if (capTimer) clearTimeout(capTimer);
    capTimer = null;
    onCondition(condition);
  };

  const run = (mine: number) => {
    result = 'pending';
    void probe(url).then((found) => {
      if (mine !== token) return;
      result = found;
      evaluate();
    });
  };

  function evaluate() {
    if (!active || !loaded || result === 'pending') return;
    if (result === 'reached') {
      finish(undefined);
    } else if (result === 'rejected') {
      finish('failed');
    } else if (second) {
      finish(frameReadable() ? undefined : 'failed');
    } else {
      second = true;
      run(token);
    }
  }

  return {
    /** Starts a load of `target`. The first start keeps a `load` that came before it. */
    start(kind: 'loading' | 'reloading', target: string, first = false) {
      const mine = ++token;
      active = true;
      capped = false;
      second = false;
      url = target;
      if (!first) loaded = false;
      if (capTimer) clearTimeout(capTimer);
      capTimer = setTimeout(() => {
        if (mine !== token || !active) return;
        capped = true;
        onCondition('failed');
      }, capMs);
      onCondition(kind);
      run(mine);
    },
    /** The iframe fired `load`. */
    loaded() {
      loaded = true;
      if (capped && result !== 'rejected') {
        capped = false;
        second = true;
        run(token);
        return;
      }
      evaluate();
    },
    dispose() {
      token += 1;
      active = false;
      if (capTimer) clearTimeout(capTimer);
    },
  };
}
