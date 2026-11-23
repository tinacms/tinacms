import {
  PreviewFrame,
  type PreviewScale,
} from '@tinacms/ui/components/preview-frame';
import { PreviewToolbar } from '@tinacms/ui/components/preview-toolbar';
import { useTier } from '@tinacms/ui/hooks/use-tier';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  type PreviewConnectionOptions,
  usePreviewConnection,
} from '../editor/preview-connection';
import {
  displayAddress,
  frameAddress,
  isHashOnlyChange,
  parseAddress,
} from './preview-address';
import {
  type LoadCondition,
  type ProbeResult,
  createPreviewLoad,
} from './preview-load';
import { usePreviewDevice } from './use-preview-device';

const PROBE_TIMEOUT_MS = 10_000;
const HOW_PREVIEWS_ARE_SET_UP =
  'https://tina.io/docs/contextual-editing/overview';

const isWebAddress = (href: string) => /^https?:\/\//i.test(href);

/** Asks the site for the address, without reading the answer, so a down site is told from a slow one. */
function probe(url: string): Promise<ProbeResult> {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, PROBE_TIMEOUT_MS);
  return fetch(url, {
    mode: 'no-cors',
    cache: 'no-store',
    signal: controller.signal,
  })
    .then(
      () => 'reached' as const,
      () => (timedOut ? ('timeout' as const) : ('rejected' as const))
    )
    .finally(() => clearTimeout(timer));
}

const withoutHash = (href: string) => {
  const url = new URL(href);
  url.hash = '';
  return url.href;
};

interface PreviewPaneProps {
  src: string;
  connection: PreviewConnectionOptions;
  expanded: boolean;
  moveFocus: boolean;
  onExpandedChange: (expanded: boolean) => void;
}

/**
 * The toolbar and the frame around the preview iframe. The iframe stays one element for the
 * slot's life: a new address, Reload and every size change move or resize it, never remount it.
 */
function PreviewPane({
  src,
  connection,
  expanded,
  moveFocus,
  onExpandedChange,
}: PreviewPaneProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const paneRef = useRef<HTMLDivElement>(null);
  usePreviewConnection(iframeRef, {
    ...connection,
    onPageUrl: (pageUrl) => followPageUrl(pageUrl),
  });

  const [startHref] = useState(() => new URL(src, window.location.href).href);
  const previewOrigin = new URL(startHref).origin;
  const [href, setHref] = useState(startHref);
  const knownHref = useRef(href);
  knownHref.current = href;

  const [storedDevice, setDevice] = usePreviewDevice();
  const tier = useTier();
  const device = tier === 'phone' ? 'fit' : storedDevice;
  const [scale, setScale] = useState<PreviewScale>('fit');
  const [fitWidth, setFitWidth] = useState<number>();
  const [fitScale, setFitScale] = useState(100);
  const [condition, setCondition] = useState<LoadCondition>('loading');
  const [addressError, setAddressError] = useState<string>();

  // The address of the admin-started load that has not shown its page yet. The frame may still
  // hold the document from before it, so this is the current address while it is set.
  const pending = useRef<string | null>(null);
  const startLoad = (
    kind: 'loading' | 'reloading',
    target: string,
    first = false
  ) => {
    pending.current = target;
    load.start(kind, target, first);
  };

  const [load] = useState(() =>
    createPreviewLoad({
      probe,
      frameReadable: () => framePage() !== null,
      onCondition: (next) => {
        if (next === undefined) {
          pending.current = null;
          // The page may have redirected, and the load event came before the probe settled.
          const shown = framePage();
          if (shown) setHref(shown);
        }
        setCondition(next);
      },
    })
  );

  // The frame's location when it shows a page of the site; null for the blank page before the first one.
  const framePage = (): string | null => {
    try {
      const live = iframeRef.current?.contentWindow?.location.href;
      if (live && isWebAddress(live)) return live;
    } catch {
      // A cross-origin page and the browser's error page throw on this read.
    }
    return null;
  };
  const liveHref = () => pending.current ?? framePage() ?? knownHref.current;

  // A layout effect, so the first load starts before the iframe can fire `load`.
  useLayoutEffect(() => {
    startLoad('loading', knownHref.current, true);
    return load.dispose;
  }, [load]);

  const onFrameLoad = () => {
    load.loaded();
    // While a load is still pending, a load event may be the document from before it.
    if (pending.current !== null) return;
    const live = liveHref();
    if (live !== knownHref.current) setHref(live);
  };

  const followPageUrl = (pageUrl: string) => {
    try {
      const url = new URL(pageUrl);
      if (url.origin === previewOrigin && isWebAddress(url.href)) {
        setHref(url.href);
      }
    } catch {
      // A message with a url that is not an address changes nothing.
    }
  };

  const moveFrame = (target: string) => {
    if (iframeRef.current) iframeRef.current.src = target;
  };

  const reload = () => {
    const awaiting = pending.current !== null;
    const page = framePage();
    const target = pending.current ?? page ?? knownHref.current;
    const showing = condition === undefined || condition === 'reloading';
    startLoad(showing ? 'reloading' : 'loading', target);
    const frame = iframeRef.current;
    if (!frame) return;
    if (page && !awaiting && condition !== 'failed') {
      try {
        frame.contentWindow?.location.reload();
        return;
      } catch {
        // A cross-origin page throws on reload; fall back to navigating to its address.
      }
    }
    // A fragment-only change fetches nothing, so a target on the frame's own document goes without its hash.
    const sameDocument =
      page !== null && withoutHash(page) === withoutHash(target);
    frame.src = sameDocument ? withoutHash(target) : target;
  };

  const navigate = (typed: string) => {
    const parsed = parseAddress(typed, previewOrigin);
    if (!parsed) return;
    if (!parsed.ok) {
      setAddressError(`Type an address on ${new URL(previewOrigin).host}`);
      return;
    }
    const next = parsed.url.href;
    const current = liveHref();
    if (next === current) {
      reload();
      return;
    }
    setHref(next);
    const pendingLoad = pending.current !== null;
    // While a load is pending or failed, any other address is a new load.
    if (!pendingLoad && isHashOnlyChange(current, next)) {
      moveFrame(next);
      return;
    }
    startLoad('loading', next);
    // A fragment on the frame's own document fetches nothing and leaves the pending navigation running.
    const page = framePage();
    const sameDocument =
      pendingLoad && page !== null && withoutHash(page) === withoutHash(next);
    moveFrame(sameDocument ? withoutHash(next) : next);
  };

  const openInNewTab = () => {
    window.open(liveHref(), '_blank', 'noopener');
  };

  const changeDevice = (next: typeof device) => {
    setDevice(next);
    if (next === 'fit') setScale('fit');
  };

  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (!moveFocus) return;
    const name = expanded ? 'Collapse preview' : 'Expand preview';
    const bar = paneRef.current?.querySelector('[data-slot=preview-toolbar]');
    // In a narrow pane the toggle lives in the actions menu, so focus goes to its button.
    (
      bar?.querySelector<HTMLElement>(`button[aria-label="${name}"]`) ??
      bar?.querySelector<HTMLElement>('button[aria-label="Preview actions"]')
    )?.focus();
  }, [expanded, moveFocus]);

  return (
    <div ref={paneRef} className='flex min-h-0 min-w-0 flex-1 flex-col'>
      <PreviewToolbar
        address={displayAddress(href)}
        onNavigate={navigate}
        onAddressInput={() => setAddressError(undefined)}
        addressError={addressError}
        device={device}
        onDeviceChange={changeDevice}
        fitWidth={fitWidth}
        scale={scale}
        fitScale={fitScale}
        onScaleChange={setScale}
        onReload={reload}
        onOpenInNewTab={openInNewTab}
        expanded={expanded}
        onExpandedChange={onExpandedChange}
      />
      <PreviewFrame
        device={device}
        scale={scale}
        condition={condition}
        onFitWidthChange={setFitWidth}
        onFitScaleChange={setFitScale}
        onReload={reload}
      >
        <iframe
          ref={iframeRef}
          src={frameAddress(src, window.location.href, startHref)}
          title='Preview'
          className='size-full border-none'
          onLoad={onFrameLoad}
        />
      </PreviewFrame>
    </div>
  );
}

export function NoPreview() {
  return (
    <PreviewFrame
      condition='no-preview'
      onHowTo={() => window.open(HOW_PREVIEWS_ARE_SET_UP, '_blank', 'noopener')}
    />
  );
}

export interface PreviewSlotProps extends Omit<PreviewPaneProps, 'src'> {
  src: string;
}

/** The string-URL preview beside the form: the toolbar and the frame around the iframe. */
export function PreviewSlot(props: PreviewSlotProps) {
  return (
    <div
      data-preview-slot=''
      className='relative flex min-w-0 flex-1 flex-col overflow-clip contain-[inline-size]'
    >
      <PreviewPane {...props} />
    </div>
  );
}
