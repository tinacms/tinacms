import { invariant } from '../core/invariant';
import type { TinaDocument } from '../core/schema/types';
import {
  MARKED_SELECTOR,
  type OutlineOverlay,
  createOutlineOverlay,
  findActive,
  findHovered,
} from './outline';
import {
  type DeclaredDocument,
  type Mark,
  type OutlineMessage,
  TINA_DOCUMENT_ATTR,
  TINA_FIELD_ATTR,
  activateMessage,
  documentsMessage,
  isOutlineMessage,
  isValuesMessage,
  readyMessage,
} from './protocol';

export interface PreviewRegistration {
  document?: string;
  shared?: boolean;
  onValues: (values: TinaDocument) => void;
}

export interface PreviewBridge {
  register: (registration: PreviewRegistration) => () => void;
  /** Schedules a `tina:documents` when the page URL moved without a declaration change. */
  syncUrl: () => void;
  destroy: () => void;
}

export interface GetPreviewBridgeOptions {
  previewWindow: Window;
  editorWindow: Window;
  allowedOrigin: string;
}

const bridges = new WeakMap<
  Window,
  { origin: string; bridge: PreviewBridge }
>();

/** One bridge per preview window; its origin is the first caller's. */
export const getPreviewBridge = ({
  previewWindow,
  editorWindow,
  allowedOrigin,
}: GetPreviewBridgeOptions): PreviewBridge => {
  invariant(
    allowedOrigin !== '*',
    'preview-allowed-origin-wildcard',
    "allowedOrigin must name the editor's origin — never '*'."
  );
  const existing = bridges.get(previewWindow);
  if (existing) {
    invariant(
      existing.origin === allowedOrigin,
      'preview-allowed-origin-conflict',
      `useTina was given allowedOrigin '${allowedOrigin}' but this page's preview bridge already uses '${existing.origin}'. Every useTina on a page must use the same allowedOrigin.`
    );
    return existing.bridge;
  }
  const bridge = createPreviewBridge({
    previewWindow,
    editorWindow,
    allowedOrigin,
  });
  bridges.set(previewWindow, { origin: allowedOrigin, bridge });
  return bridge;
};

export const destroyPreviewBridge = (previewWindow: Window) => {
  bridges.get(previewWindow)?.bridge.destroy();
  bridges.delete(previewWindow);
};

const isDevelopment =
  typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';

const mergeDeclarations = (
  registrations: Iterable<PreviewRegistration>
): DeclaredDocument[] => {
  const byPath = new Map<string, boolean>();
  for (const { document, shared } of registrations) {
    if (!document) continue;
    byPath.set(document, (byPath.get(document) ?? true) && shared === true);
  }
  return Array.from(byPath, ([path, isShared]) =>
    isShared ? { path, shared: true } : { path }
  );
};

const sameMark = (a: Mark | null, b: Mark | null) =>
  a?.address === b?.address && a?.document === b?.document;

const isOffSiteLink = (anchor: HTMLAnchorElement, page: Window): boolean => {
  if (anchor.hasAttribute('download')) return false;
  if (anchor.getAttribute('target')) return false;
  let url: URL;
  try {
    url = new URL(anchor.href);
  } catch {
    return false;
  }
  return (
    (url.protocol === 'http:' || url.protocol === 'https:') &&
    url.origin !== page.location.origin
  );
};

const hasModifier = (event: MouseEvent) =>
  event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;

const outsideViewport = (rect: DOMRect, page: Window) =>
  rect.bottom < 0 ||
  rect.top > page.innerHeight ||
  rect.right < 0 ||
  rect.left > page.innerWidth;

const createPreviewBridge = ({
  previewWindow,
  editorWindow,
  allowedOrigin,
}: GetPreviewBridgeOptions): PreviewBridge => {
  const page = previewWindow.document;
  const registrations = new Set<PreviewRegistration>();

  let answered = false;
  let readySent = false;
  let lastSent: { key: string; url: string } | null = null;
  let flushQueued = false;
  let warnedUndeclared = false;
  let destroyed = false;

  const storedValues = new Map<string, TinaDocument>();
  let storedUndocumented: TinaDocument | null = null;
  let lastPointer: { x: number; y: number } | null = null;

  let hovered: Mark | null = null;
  let active: OutlineMessage['active'] = null;
  let pointerHover: Element | null = null;
  let lastClicked: Element | null = null;
  let overlay: OutlineOverlay | null = null;
  let mutationObserver: MutationObserver | null = null;
  let resizeObserver: ResizeObserver | null = null;
  let observedSizes = new Set<Element>();
  let drawFrame: number | null = null;
  let scrollOnNextDraw = false;

  const post = (message: unknown) =>
    editorWindow.postMessage(message, allowedOrigin);

  const mainDocument = () =>
    mergeDeclarations(registrations).find((entry) => !entry.shared)?.path;

  const pageDeclares = () => [...registrations].some((entry) => entry.document);

  const pruneStored = () => {
    if (pageDeclares()) storedUndocumented = null;
    const declared = new Set<string | undefined>(
      [...registrations].map((entry) => entry.document)
    );
    for (const path of [...storedValues.keys()]) {
      if (!declared.has(path)) storedValues.delete(path);
    }
  };

  const flush = () => {
    flushQueued = false;
    pruneStored();
    const documents = mergeDeclarations(registrations);
    const key = JSON.stringify(documents);
    const url = previewWindow.location.href;
    if (!readySent) {
      readySent = true;
      post(readyMessage(documents.length > 0 ? documents : undefined, url));
    } else if (lastSent?.key !== key || lastSent.url !== url) {
      post(documentsMessage(documents, url));
    }
    lastSent = { key, url };

    const declares = documents.length > 0;
    const hasUndeclared = [...registrations].some((entry) => !entry.document);
    if (isDevelopment && declares && hasUndeclared && !warnedUndeclared) {
      warnedUndeclared = true;
      console.warn(
        'useTina: this page declares a document in one useTina call but another call has no `document`. The undeclared call only receives values without a document. Pass `document` to every useTina call.'
      );
    }
  };

  const scheduleFlush = () => {
    if (destroyed || flushQueued) return;
    flushQueued = true;
    Promise.resolve().then(() => {
      if (flushQueued) flush();
    });
  };

  const routeValues = (values: TinaDocument, document: string | undefined) => {
    const declaring = pageDeclares();
    if (document === undefined) {
      if (!declaring) storedUndocumented = values;
    } else if (
      [...registrations].some((entry) => entry.document === document)
    ) {
      storedValues.set(document, values);
    }
    for (const registration of [...registrations]) {
      const takes =
        document === undefined ||
        (registration.document
          ? registration.document === document
          : !declaring);
      if (takes) registration.onValues(values);
    }
  };

  const ensureOverlay = () => {
    overlay ??= createOutlineOverlay(previewWindow);
    return overlay;
  };

  const draw = () => {
    drawFrame = null;
    if (!answered) return;
    const main = mainDocument();
    const activeElement = active
      ? findActive(page, active, main, lastClicked)
      : null;
    const hoveredElements = new Set<Element>();
    if (pointerHover?.isConnected) hoveredElements.add(pointerHover);
    if (hovered) {
      for (const element of findHovered(page, hovered, main)) {
        hoveredElements.add(element);
      }
    }
    if (activeElement) hoveredElements.delete(activeElement);

    ensureOverlay().render({
      hovered: [...hoveredElements],
      active:
        active && activeElement
          ? { element: activeElement, name: active.name }
          : null,
    });

    observeSizes(
      new Set([...hoveredElements, ...(activeElement ? [activeElement] : [])])
    );

    if (scrollOnNextDraw) {
      scrollOnNextDraw = false;
      if (
        activeElement &&
        !(lastClicked && activeElement.contains(lastClicked)) &&
        outsideViewport(activeElement.getBoundingClientRect(), previewWindow)
      ) {
        activeElement.scrollIntoView({ block: 'nearest' });
      }
    }
  };

  const observeSizes = (elements: Set<Element>) => {
    if (typeof ResizeObserver !== 'function') return;
    resizeObserver ??= new ResizeObserver(scheduleDraw);
    for (const element of observedSizes) {
      if (!elements.has(element)) resizeObserver.unobserve(element);
    }
    for (const element of elements) {
      if (!observedSizes.has(element)) resizeObserver.observe(element);
    }
    observedSizes = elements;
  };

  function scheduleDraw() {
    if (!answered || drawFrame !== null) return;
    drawFrame = previewWindow.requestAnimationFrame(draw);
  }

  const observeMutations = () => {
    if (mutationObserver || typeof MutationObserver !== 'function') return;
    mutationObserver = new MutationObserver((records) => {
      const external = records.some(
        (record) =>
          !overlay?.contains(record.target) &&
          ![...record.addedNodes, ...record.removedNodes].every((node) =>
            overlay?.contains(node)
          )
      );
      if (external) scheduleDraw();
    });
    mutationObserver.observe(page, {
      subtree: true,
      childList: true,
      attributes: true,
      characterData: true,
    });
  };

  const becomeAnswered = () => {
    if (answered) return;
    answered = true;
    if (lastPointer) {
      const under = page.elementFromPoint(lastPointer.x, lastPointer.y);
      pointerHover = under?.closest(MARKED_SELECTOR) ?? null;
      if (pointerHover) scheduleDraw();
    }
  };

  const onMessage = (event: MessageEvent) => {
    if (event.origin !== allowedOrigin || event.source !== editorWindow) return;
    if (isValuesMessage(event.data)) {
      becomeAnswered();
      routeValues(event.data.values, event.data.document);
    } else if (isOutlineMessage(event.data)) {
      becomeAnswered();
      const activeChanged = !sameMark(active, event.data.active);
      hovered = event.data.hovered;
      active = event.data.active;
      if (activeChanged && active) scrollOnNextDraw = true;
      observeMutations();
      scheduleDraw();
    }
  };

  const markedTarget = (event: Event) =>
    event.target instanceof Element
      ? event.target.closest(MARKED_SELECTOR)
      : null;

  const onClickCapture = (event: MouseEvent) => {
    if (!answered) return;
    const marked = markedTarget(event);
    const address = marked?.getAttribute(TINA_FIELD_ATTR);
    if (!marked || !address) return;
    lastClicked = marked;
    post(
      activateMessage(
        address,
        marked.getAttribute(TINA_DOCUMENT_ATTR) ?? undefined
      )
    );
    event.preventDefault();
  };

  const onClickBubble = (event: MouseEvent) => {
    if (!answered || event.defaultPrevented) return;
    if (event.button !== 0 || hasModifier(event)) return;
    if (!(event.target instanceof Element)) return;
    const anchor = event.target.closest('a[href]');
    if (!(anchor instanceof HTMLAnchorElement)) return;
    if (!isOffSiteLink(anchor, previewWindow)) return;
    event.preventDefault();
    previewWindow.open(anchor.href, '_blank', 'noopener');
  };

  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
    lastPointer = { x: event.clientX, y: event.clientY };
    if (!answered) return;
    const next = markedTarget(event);
    if (next === pointerHover) return;
    pointerHover = next;
    scheduleDraw();
  };

  const clearPointerHover = () => {
    lastPointer = null;
    if (!pointerHover) return;
    pointerHover = null;
    scheduleDraw();
  };

  const onPointerOut = (event: PointerEvent) => {
    if (event.relatedTarget === null) clearPointerHover();
  };

  previewWindow.addEventListener('message', onMessage);
  previewWindow.addEventListener('click', onClickCapture, true);
  page.addEventListener('click', onClickBubble);
  page.addEventListener('pointermove', onPointerMove);
  page.addEventListener('pointerout', onPointerOut);
  previewWindow.addEventListener('scroll', scheduleDraw, true);
  previewWindow.addEventListener('resize', scheduleDraw);
  previewWindow.addEventListener('popstate', scheduleFlush);
  previewWindow.addEventListener('hashchange', scheduleFlush);
  scheduleFlush();

  return {
    register: (registration) => {
      registrations.add(registration);
      const replay = registration.document
        ? storedValues.get(registration.document)
        : pageDeclares()
          ? undefined
          : storedUndocumented;
      if (replay) registration.onValues(replay);
      scheduleFlush();
      scheduleDraw();
      return () => {
        registrations.delete(registration);
        scheduleFlush();
      };
    },
    syncUrl: scheduleFlush,
    destroy: () => {
      destroyed = true;
      flushQueued = false;
      previewWindow.removeEventListener('message', onMessage);
      previewWindow.removeEventListener('click', onClickCapture, true);
      page.removeEventListener('click', onClickBubble);
      page.removeEventListener('pointermove', onPointerMove);
      page.removeEventListener('pointerout', onPointerOut);
      previewWindow.removeEventListener('scroll', scheduleDraw, true);
      previewWindow.removeEventListener('resize', scheduleDraw);
      previewWindow.removeEventListener('popstate', scheduleFlush);
      previewWindow.removeEventListener('hashchange', scheduleFlush);
      mutationObserver?.disconnect();
      resizeObserver?.disconnect();
      if (drawFrame !== null) previewWindow.cancelAnimationFrame(drawFrame);
      overlay?.destroy();
      registrations.clear();
      storedValues.clear();
      storedUndocumented = null;
    },
  };
};
