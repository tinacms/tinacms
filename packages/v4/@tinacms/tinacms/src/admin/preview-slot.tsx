import {
  PreviewFrame,
  type PreviewScale,
} from '@tinacms/ui/components/preview-frame';
import { PreviewToolbar } from '@tinacms/ui/components/preview-toolbar';
import { useTier } from '@tinacms/ui/hooks/use-tier';
import { useEffect, useRef, useState } from 'react';
import {
  type PreviewConnectionOptions,
  usePreviewConnection,
} from '../editor/preview-connection';
import { isDocumentsMessage, isReadyMessage } from '../preview/protocol';
import {
  displayAddress,
  isHashOnlyChange,
  parseAddress,
} from './preview-address';
import { usePreviewDevice } from './use-preview-device';

const PROBE_TIMEOUT_MS = 10_000;
const HOW_PREVIEWS_ARE_SET_UP =
  'https://tina.io/docs/contextual-editing/overview';

type Condition = 'loading' | 'reloading' | 'failed' | undefined;

const isWebAddress = (href: string) => /^https?:\/\//i.test(href);

interface LoadState {
  token: number;
  active: boolean;
  loaded: boolean;
  probe: 'pending' | 'reached' | 'failed';
  abort: AbortController | null;
  timer: ReturnType<typeof setTimeout> | null;
}

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
  usePreviewConnection(iframeRef, connection);

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
  const [condition, setCondition] = useState<Condition>('loading');
  const [addressError, setAddressError] = useState<string>();

  const load = useRef<LoadState>({
    token: 0,
    active: false,
    loaded: false,
    probe: 'pending',
    abort: null,
    timer: null,
  });

  const liveHref = (): string => {
    try {
      const live = iframeRef.current?.contentWindow?.location.href;
      if (live && isWebAddress(live)) return live;
    } catch {}
    return knownHref.current;
  };

  const settle = () => {
    const state = load.current;
    if (!state.active || !state.loaded || state.probe === 'pending') return;
    state.active = false;
    setCondition(state.probe === 'failed' ? 'failed' : undefined);
  };

  const endProbe = () => {
    const state = load.current;
    state.abort?.abort();
    if (state.timer) clearTimeout(state.timer);
    state.abort = null;
    state.timer = null;
  };

  // Each admin-started load takes a token; the events of an older token are ignored.
  const startLoad = (kind: 'loading' | 'reloading', target: string) => {
    const state = load.current;
    endProbe();
    const token = ++state.token;
    state.active = true;
    state.loaded = false;
    state.probe = 'pending';
    const controller = new AbortController();
    state.abort = controller;
    state.timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
    setCondition(kind);
    fetch(target, {
      mode: 'no-cors',
      cache: 'no-store',
      signal: controller.signal,
    })
      .then(
        () => 'reached' as const,
        () => 'failed' as const
      )
      .then((result) => {
        if (token !== state.token) return;
        if (state.timer) clearTimeout(state.timer);
        state.probe = result;
        settle();
      });
  };

  useEffect(() => {
    startLoad('loading', knownHref.current);
    return endProbe;
    // The first load starts once per mount; later loads start from the toolbar.
  }, []);

  const onFrameLoad = () => {
    const live = liveHref();
    if (live !== knownHref.current) setHref(live);
    load.current.loaded = true;
    settle();
  };

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (
        event.origin !== previewOrigin ||
        event.source !== iframeRef.current?.contentWindow
      ) {
        return;
      }
      const data: unknown = event.data;
      if (!(isReadyMessage(data) || isDocumentsMessage(data))) return;
      if (data.url === undefined) return;
      try {
        const url = new URL(data.url);
        if (url.origin === previewOrigin && isWebAddress(url.href)) {
          setHref(url.href);
        }
      } catch {}
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [previewOrigin]);

  const moveFrame = (target: string) => {
    if (iframeRef.current) iframeRef.current.src = target;
  };

  const reload = () => {
    const target = liveHref();
    startLoad(condition === undefined ? 'reloading' : 'loading', target);
    const frame = iframeRef.current;
    if (!frame) return;
    if (condition !== 'failed') {
      try {
        frame.contentWindow?.location.reload();
        return;
      } catch {}
    }
    frame.src = target;
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
    if (isHashOnlyChange(current, next)) {
      moveFrame(next);
      return;
    }
    startLoad('loading', next);
    moveFrame(next);
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
    paneRef.current
      ?.querySelector<HTMLElement>(
        `[data-slot=preview-toolbar] button[aria-label="${name}"]`
      )
      ?.focus();
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
          src={src}
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
    <div data-preview-slot='' className='flex min-w-0 flex-1 flex-col'>
      <PreviewPane {...props} />
    </div>
  );
}
