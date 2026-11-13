import { TINA_DOCUMENT_ATTR, TINA_FIELD_ATTR, type Mark } from './protocol';

/** Literal values copied from the design tokens; the site has no Tina CSS. */
export const OUTLINE_COLORS = {
  '--pv-muted': '#64748b',
  '--primary': '#d13f13',
  '--primary-foreground': '#ffffff',
  white: '#ffffff',
} as const;

const OVERLAY_Z_INDEX = '2147483647';
const TAB_HEIGHT = 20;

export const MARKED_SELECTOR = `[${TINA_FIELD_ATTR}]`;

/** Segment-wise on `.`: `blocks.1` is a prefix of `blocks.1.text`, never of `blocks.10`. */
const isAddressPrefix = (prefix: string, address: string): boolean =>
  prefix === address || address.startsWith(`${prefix}.`);

const documentOf = (element: Element, mainDocument: string | undefined) =>
  element.getAttribute(TINA_DOCUMENT_ATTR) ?? mainDocument;

const markedElements = (root: ParentNode): Element[] =>
  Array.from(root.querySelectorAll(MARKED_SELECTOR));

const matchesDocument = (
  element: Element,
  mark: Mark,
  mainDocument: string | undefined
): boolean => documentOf(element, mainDocument) === mark.document;

export const findHovered = (
  root: ParentNode,
  mark: Mark,
  mainDocument: string | undefined
): Element[] =>
  markedElements(root).filter(
    (element) =>
      element.getAttribute(TINA_FIELD_ATTR) === mark.address &&
      matchesDocument(element, mark, mainDocument)
  );

/**
 * The element whose address equals the active address, else the one with the
 * longest address that is a prefix of it. Ties go to the last clicked element,
 * else the first in document order.
 */
export const findActive = (
  root: ParentNode,
  mark: Mark,
  mainDocument: string | undefined,
  lastClicked: Element | null
): Element | null => {
  let bestLength = -1;
  let best: Element[] = [];
  for (const element of markedElements(root)) {
    const address = element.getAttribute(TINA_FIELD_ATTR);
    if (!address || !isAddressPrefix(address, mark.address)) continue;
    if (!matchesDocument(element, mark, mainDocument)) continue;
    if (address.length > bestLength) {
      bestLength = address.length;
      best = [element];
    } else if (address.length === bestLength) {
      best.push(element);
    }
  }
  if (lastClicked && best.includes(lastClicked)) return lastClicked;
  return best[0] ?? null;
};

export interface OutlineFrame {
  hovered: Element[];
  active: { element: Element; name: string } | null;
}

export interface OutlineOverlay {
  render: (frame: OutlineFrame) => void;
  contains: (node: Node) => boolean;
  destroy: () => void;
}

const place = (box: HTMLElement, rect: DOMRect) => {
  Object.assign(box.style, {
    position: 'absolute',
    boxSizing: 'border-box',
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    pointerEvents: 'none',
  });
};

/**
 * Draws outlines in a closed shadow root appended to `body`. The host is
 * `position: fixed` and ignores the pointer, so the site's layout and
 * hit-testing are untouched. Styles go through the CSSOM so a strict page CSP
 * does not block them.
 */
export const createOutlineOverlay = (page: Window): OutlineOverlay => {
  const { document } = page;
  const host = document.createElement('div');
  Object.assign(host.style, {
    position: 'fixed',
    inset: '0',
    overflow: 'hidden',
    pointerEvents: 'none',
    zIndex: OVERLAY_Z_INDEX,
  });
  const root = host.attachShadow({ mode: 'closed' });

  const hoverBox = (rect: DOMRect) => {
    const box = document.createElement('div');
    box.dataset.outline = 'hover';
    place(box, rect);
    Object.assign(box.style, {
      border: `1px dashed ${OUTLINE_COLORS['--pv-muted']}`,
      boxShadow: `0 0 0 1px ${OUTLINE_COLORS.white}`,
    });
    return box;
  };

  const activeBox = (rect: DOMRect, name: string) => {
    const box = document.createElement('div');
    box.dataset.outline = 'active';
    place(box, rect);
    Object.assign(box.style, {
      border: `2px solid ${OUTLINE_COLORS['--primary']}`,
    });
    const tab = document.createElement('div');
    tab.dataset.outlineTab = '';
    tab.setAttribute('aria-hidden', 'true');
    tab.textContent = name;
    const flipBelow = rect.top < TAB_HEIGHT;
    Object.assign(tab.style, {
      position: 'absolute',
      left: '-2px',
      [flipBelow ? 'top' : 'bottom']: flipBelow ? 'calc(100% + 2px)' : '100%',
      height: `${TAB_HEIGHT}px`,
      lineHeight: `${TAB_HEIGHT}px`,
      padding: '0 6px',
      font: '600 11px/20px system-ui, sans-serif',
      whiteSpace: 'nowrap',
      color: OUTLINE_COLORS['--primary-foreground'],
      background: OUTLINE_COLORS['--primary'],
      pointerEvents: 'none',
    });
    box.append(tab);
    return box;
  };

  return {
    render: ({ hovered, active }) => {
      if (!host.isConnected) document.body.append(host);
      root.replaceChildren(
        ...hovered.map((element) => hoverBox(element.getBoundingClientRect())),
        ...(active
          ? [activeBox(active.element.getBoundingClientRect(), active.name)]
          : [])
      );
    },
    contains: (node) => node === host,
    destroy: () => host.remove(),
  };
};
