import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { destroyPreviewBridge, getPreviewBridge } from './bridge';
import {
  activateMessage,
  documentsMessage,
  outlineMessage,
  readyMessage,
  valuesMessage,
} from './protocol';

type FakeEditor = Window & { postMessage: ReturnType<typeof vi.fn> };
const fakeEditor = () => ({ postMessage: vi.fn() }) as unknown as FakeEditor;

const fromEditor = (
  editor: Window,
  data: unknown,
  origin: string = window.origin
) => {
  const event = new MessageEvent('message', { data });
  Object.defineProperty(event, 'origin', { value: origin });
  Object.defineProperty(event, 'source', { value: editor });
  window.dispatchEvent(event);
};

const flush = () => Promise.resolve().then(() => Promise.resolve());

let frames: FrameRequestCallback[] = [];
const runFrames = () => {
  const pending = frames;
  frames = [];
  for (const callback of pending) callback(0);
};

const rect = (left: number, top: number, width = 100, height = 40) =>
  ({
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    x: left,
    y: top,
    toJSON: () => ({}),
  }) as DOMRect;

const marked = (
  address: string,
  options: { document?: string; tag?: string; parent?: Element } = {}
) => {
  const element = document.createElement(options.tag ?? 'div');
  element.setAttribute('data-tina-field', address);
  if (options.document)
    element.setAttribute('data-tina-document', options.document);
  (options.parent ?? document.body).append(element);
  return element;
};

const originalAttachShadow = HTMLElement.prototype.attachShadow;
const overlayRoot = () =>
  Array.from(document.body.children)
    .map((child) => child.shadowRoot)
    .find((root) => root !== null) ?? null;
const drawn = (kind: 'hover' | 'active') =>
  Array.from(overlayRoot()?.querySelectorAll(`[data-outline="${kind}"]`) ?? []);

beforeEach(() => {
  const { happyDOM } = window as Window & {
    happyDOM?: {
      settings: { navigation: { disableMainFrameNavigation: boolean } };
    };
  };
  if (happyDOM) happyDOM.settings.navigation.disableMainFrameNavigation = true;
  frames = [];
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    frames.push(callback);
    return frames.length;
  });
  vi.spyOn(HTMLElement.prototype, 'attachShadow').mockImplementation(function (
    this: HTMLElement,
    init
  ) {
    return originalAttachShadow.call(this, { ...init, mode: 'open' });
  });
});

afterEach(() => {
  destroyPreviewBridge(window);
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

const start = (editor = fakeEditor(), allowedOrigin = window.origin) => ({
  editor,
  bridge: getPreviewBridge({
    previewWindow: window,
    editorWindow: editor,
    allowedOrigin,
  }),
});

const startAnswered = () => {
  const started = start();
  fromEditor(started.editor, outlineMessage(null, null));
  return started;
};

describe('declarations', () => {
  it('sends one ready with every document registered in the same task, in order', async () => {
    const { editor, bridge } = start();
    bridge.register({ document: 'a.md', onValues: vi.fn() });
    bridge.register({ document: 'nav.json', shared: true, onValues: vi.fn() });
    await flush();
    expect(editor.postMessage).toHaveBeenCalledTimes(1);
    expect(editor.postMessage).toHaveBeenCalledWith(
      readyMessage(
        [{ path: 'a.md' }, { path: 'nav.json', shared: true }],
        window.location.href
      ),
      window.origin
    );
  });

  it('sends ready without documents when no hook declares one', async () => {
    const { editor, bridge } = start();
    bridge.register({ onValues: vi.fn() });
    await flush();
    expect(editor.postMessage).toHaveBeenCalledWith(
      readyMessage(undefined, window.location.href),
      window.origin
    );
  });

  it('sends one documents message with the remaining set after an unmount', async () => {
    const { editor, bridge } = start();
    bridge.register({ document: 'a.md', onValues: vi.fn() });
    const unregister = bridge.register({ document: 'b.md', onValues: vi.fn() });
    await flush();
    editor.postMessage.mockClear();
    unregister();
    await flush();
    expect(editor.postMessage).toHaveBeenCalledTimes(1);
    expect(editor.postMessage).toHaveBeenCalledWith(
      documentsMessage([{ path: 'a.md' }], window.location.href),
      window.origin
    );
  });

  it('sends nothing for a register, unregister and re-register in one task, and the remounted hook keeps the last values', async () => {
    const { editor, bridge } = start();
    bridge.register({ document: 'a.md', onValues: vi.fn() });
    await flush();
    fromEditor(editor, valuesMessage({ title: 'Edited' }, 'a.md'));
    editor.postMessage.mockClear();
    const first = bridge.register({ document: 'a.md', onValues: vi.fn() });
    first();
    const remounted = vi.fn();
    bridge.register({ document: 'a.md', onValues: remounted });
    await flush();
    expect(editor.postMessage).not.toHaveBeenCalled();
    expect(remounted).toHaveBeenCalledWith({ title: 'Edited' });
  });

  it('collapses duplicate paths and keeps the entry non-shared if any is', async () => {
    const { editor, bridge } = start();
    bridge.register({ document: 'a.md', shared: true, onValues: vi.fn() });
    bridge.register({ document: 'a.md', onValues: vi.fn() });
    bridge.register({ document: 'n.md', shared: true, onValues: vi.fn() });
    bridge.register({ document: 'n.md', shared: true, onValues: vi.fn() });
    await flush();
    expect(editor.postMessage).toHaveBeenCalledWith(
      readyMessage(
        [{ path: 'a.md' }, { path: 'n.md', shared: true }],
        window.location.href
      ),
      window.origin
    );
  });

  it('re-sends the unchanged set when the url moved on popstate, hashchange or syncUrl', async () => {
    const { editor, bridge } = start();
    bridge.register({ document: 'a.md', onValues: vi.fn() });
    await flush();
    editor.postMessage.mockClear();

    window.dispatchEvent(new Event('popstate'));
    await flush();
    expect(editor.postMessage).not.toHaveBeenCalled();

    history.pushState({}, '', '/moved-1');
    window.dispatchEvent(new Event('popstate'));
    await flush();
    expect(editor.postMessage).toHaveBeenCalledTimes(1);
    expect(editor.postMessage).toHaveBeenLastCalledWith(
      documentsMessage([{ path: 'a.md' }], `${window.location.origin}/moved-1`),
      window.origin
    );

    history.pushState({}, '', '/moved-1#x');
    window.dispatchEvent(new Event('hashchange'));
    await flush();
    expect(editor.postMessage).toHaveBeenCalledTimes(2);

    history.pushState({}, '', '/moved-2');
    bridge.syncUrl();
    await flush();
    expect(editor.postMessage).toHaveBeenCalledTimes(3);
    history.pushState({}, '', '/');
  });
});

describe('values routing', () => {
  it('routes by document and ignores a foreign origin or window', () => {
    const { editor, bridge } = start();
    const a = vi.fn();
    const b = vi.fn();
    bridge.register({ document: 'a.md', onValues: a });
    bridge.register({ document: 'b.md', onValues: b });
    fromEditor(editor, valuesMessage({ t: 1 }, 'a.md'));
    expect(a).toHaveBeenCalledWith({ t: 1 });
    expect(b).not.toHaveBeenCalled();
    fromEditor(editor, valuesMessage({ t: 2 }));
    expect(a).toHaveBeenCalledTimes(2);
    expect(b).toHaveBeenCalledTimes(1);

    fromEditor(editor, valuesMessage({ t: 3 }, 'a.md'), 'https://evil.example');
    fromEditor(fakeEditor(), valuesMessage({ t: 3 }, 'a.md'));
    fromEditor(editor, { type: 'tina:values' });
    expect(a).toHaveBeenCalledTimes(2);
  });

  it('gives an undeclared hook every values message while no hook declares a document', () => {
    const { editor, bridge } = start();
    const hook = vi.fn();
    bridge.register({ onValues: hook });
    fromEditor(editor, valuesMessage({ t: 1 }, 'a.md'));
    fromEditor(editor, valuesMessage({ t: 2 }));
    expect(hook).toHaveBeenCalledTimes(2);
  });

  it('on a mixed page the undeclared hook takes only values without a document, and warns once', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { editor, bridge } = start();
    const undeclared = vi.fn();
    const shared = vi.fn();
    bridge.register({ document: 'nav.json', shared: true, onValues: shared });
    bridge.register({ onValues: undeclared });
    await flush();
    bridge.register({ onValues: vi.fn() });
    await flush();
    expect(warn).toHaveBeenCalledTimes(1);

    fromEditor(editor, valuesMessage({ n: 1 }, 'nav.json'));
    expect(shared).toHaveBeenCalledTimes(1);
    expect(undeclared).not.toHaveBeenCalled();
    fromEditor(editor, valuesMessage({ n: 2 }));
    expect(undeclared).toHaveBeenCalledWith({ n: 2 });
  });
});

describe('replay to a new registration', () => {
  it('gives a second hook for the same document the edited values with no new message to the editor', async () => {
    const { editor, bridge } = start();
    bridge.register({ document: 'a.md', onValues: vi.fn() });
    await flush();
    fromEditor(editor, valuesMessage({ title: 'Edited' }, 'a.md'));
    editor.postMessage.mockClear();
    const second = vi.fn();
    bridge.register({ document: 'a.md', onValues: second });
    await flush();
    expect(second).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledWith({ title: 'Edited' });
    expect(editor.postMessage).not.toHaveBeenCalled();
  });

  it('gives a hook for b.md none of the a.md values', async () => {
    const { editor, bridge } = start();
    bridge.register({ document: 'a.md', onValues: vi.fn() });
    fromEditor(editor, valuesMessage({ title: 'A' }, 'a.md'));
    const b = vi.fn();
    bridge.register({ document: 'b.md', onValues: b });
    await flush();
    expect(b).not.toHaveBeenCalled();
  });

  it('drops a document values once no hook declares it at the end of a task', async () => {
    const { editor, bridge } = start();
    const unregister = bridge.register({ document: 'a.md', onValues: vi.fn() });
    await flush();
    fromEditor(editor, valuesMessage({ title: 'A' }, 'a.md'));
    unregister();
    await flush();
    const later = vi.fn();
    bridge.register({ document: 'a.md', onValues: later });
    await flush();
    expect(later).not.toHaveBeenCalled();
  });

  it('replays the no-document values to an undeclared hook while nothing declares', async () => {
    const { editor, bridge } = start();
    bridge.register({ onValues: vi.fn() });
    await flush();
    fromEditor(editor, valuesMessage({ t: 1 }));
    const later = vi.fn();
    bridge.register({ onValues: later });
    expect(later).toHaveBeenCalledWith({ t: 1 });
  });

  it('never replays the no-document values to a hook for C, which keeps its own data until values for C arrive', async () => {
    const { editor, bridge } = start();
    bridge.register({ document: 'b.md', onValues: vi.fn() });
    await flush();
    fromEditor(editor, valuesMessage({ t: 'old' }));
    const c = vi.fn();
    bridge.register({ document: 'c.md', onValues: c });
    await flush();
    expect(c).not.toHaveBeenCalled();
    const undeclared = vi.fn();
    bridge.register({ onValues: undeclared });
    await flush();
    expect(undeclared).not.toHaveBeenCalled();
    fromEditor(editor, valuesMessage({ t: 'C' }, 'c.md'));
    expect(c).toHaveBeenCalledWith({ t: 'C' });
  });
});

describe('origin', () => {
  it("rejects '*'", () => {
    expect(() => start(fakeEditor(), '*')).toThrow(
      'preview-allowed-origin-wildcard'
    );
  });

  it('is fixed by the first hook; a different one fails naming both origins', () => {
    start(fakeEditor(), 'https://editor.example');
    expect(() =>
      getPreviewBridge({
        previewWindow: window,
        editorWindow: fakeEditor(),
        allowedOrigin: 'https://other.example',
      })
    ).toThrow(/https:\/\/other\.example.*https:\/\/editor\.example/);
  });

  it('shares one bridge for the same origin and honours a cross-origin opt-in', async () => {
    const editor = fakeEditor();
    const first = start(editor, 'https://editor.example').bridge;
    const second = getPreviewBridge({
      previewWindow: window,
      editorWindow: editor,
      allowedOrigin: 'https://editor.example',
    });
    expect(second).toBe(first);
    const onValues = vi.fn();
    first.register({ onValues });
    await flush();
    expect(editor.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'tina:ready' }),
      'https://editor.example'
    );
    fromEditor(editor, valuesMessage({ a: 1 }));
    expect(onValues).not.toHaveBeenCalled();
    fromEditor(editor, valuesMessage({ a: 2 }), 'https://editor.example');
    expect(onValues).toHaveBeenCalledWith({ a: 2 });
  });

  it('destroy removes its listeners', async () => {
    const { editor, bridge } = start();
    const onValues = vi.fn();
    bridge.register({ onValues });
    destroyPreviewBridge(window);
    editor.postMessage.mockClear();
    fromEditor(editor, valuesMessage({ a: 1 }));
    const target = marked('title');
    target.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true })
    );
    expect(onValues).not.toHaveBeenCalled();
    expect(editor.postMessage).not.toHaveBeenCalled();
  });
});

describe('marked clicks', () => {
  it('posts the innermost address and its document and prevents the default', () => {
    const { editor } = startAnswered();
    const outer = marked('blocks.0');
    const inner = marked('blocks.0.text', {
      parent: outer,
      document: 'a.md',
      tag: 'span',
    });
    const child = document.createElement('b');
    inner.append(child);
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    child.dispatchEvent(event);
    expect(editor.postMessage).toHaveBeenLastCalledWith(
      activateMessage('blocks.0.text', 'a.md'),
      window.origin
    );
    expect(event.defaultPrevented).toBe(true);
  });

  it('omits document when the element has none', () => {
    const { editor } = startAnswered();
    const title = marked('title');
    title.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true })
    );
    expect(editor.postMessage).toHaveBeenLastCalledWith(
      activateMessage('title'),
      window.origin
    );
  });

  it('runs before a router in an onClick that checks defaultPrevented', () => {
    startAnswered();
    const link = document.createElement('a');
    link.href = '/next';
    const title = marked('title', { parent: link, tag: 'span' });
    document.body.append(link);
    const navigate = vi.fn();
    // Stands in for the React root listener a router's Link handler runs under.
    document.body.addEventListener('click', (event) => {
      if (!event.defaultPrevented) navigate();
    });
    title.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true })
    );
    expect(navigate).not.toHaveBeenCalled();
  });

  it('leaves an unmarked link alone', () => {
    const { editor } = startAnswered();
    const link = document.createElement('a');
    link.href = '/next';
    document.body.append(link);
    editor.postMessage.mockClear();
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    expect(editor.postMessage).not.toHaveBeenCalled();
  });

  it('intercepts nothing until the editor has answered', () => {
    const { editor } = start();
    const title = marked('title');
    editor.postMessage.mockClear();
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    title.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    expect(editor.postMessage).not.toHaveBeenCalled();
  });
});

describe('off-site links', () => {
  const click = (
    href: string,
    options: {
      attrs?: Record<string, string>;
      init?: MouseEventInit;
      prevent?: boolean;
    } = {}
  ) => {
    const link = document.createElement('a');
    link.setAttribute('href', href);
    for (const [name, value] of Object.entries(options.attrs ?? {})) {
      link.setAttribute(name, value);
    }
    document.body.append(link);
    if (options.prevent)
      link.addEventListener('click', (e) => e.preventDefault());
    const event = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      ...options.init,
    });
    link.dispatchEvent(event);
    return event;
  };

  it('opens a plain click on an other-origin https link in a new tab and keeps the frame', () => {
    startAnswered();
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    const event = click('https://elsewhere.example/page');
    expect(event.defaultPrevented).toBe(true);
    expect(open).toHaveBeenCalledWith(
      'https://elsewhere.example/page',
      '_blank',
      'noopener'
    );
  });

  it.each([
    ['same-origin', () => click('/local')],
    ['mailto', () => click('mailto:a@b.example')],
    ['tel', () => click('tel:123')],
    ['javascript', () => click('javascript:void(0)')],
    ['hash only', () => click('#section')],
    [
      'modifier',
      () => click('https://elsewhere.example/', { init: { metaKey: true } }),
    ],
    [
      'shift',
      () => click('https://elsewhere.example/', { init: { shiftKey: true } }),
    ],
    [
      'target',
      () =>
        click('https://elsewhere.example/', { attrs: { target: '_blank' } }),
    ],
    [
      'download',
      () => click('https://elsewhere.example/', { attrs: { download: '' } }),
    ],
    [
      'site prevented',
      () => click('https://elsewhere.example/', { prevent: true }),
    ],
    [
      'middle button',
      () => click('https://elsewhere.example/', { init: { button: 1 } }),
    ],
  ])('leaves a %s link to the browser', (_name, act) => {
    startAnswered();
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    const event = act();
    expect(open).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(_name === 'site prevented');
  });

  it('does not touch links before the editor has answered', () => {
    start();
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    const event = click('https://elsewhere.example/');
    expect(open).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });
});

const scrollAndDraw = () => {
  window.dispatchEvent(new Event('resize'));
  runFrames();
};

describe('outlines from the editor', () => {
  const rects = new Map<Element, DOMRect>();
  beforeEach(() => {
    rects.clear();
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(
      function (this: Element) {
        return rects.get(this) ?? rect(0, 100);
      }
    );
  });
  const at = (element: Element, box: DOMRect) => {
    rects.set(element, box);
    return element;
  };

  it('draws nothing and no overlay until the editor answers', () => {
    const { bridge } = start();
    marked('title');
    bridge.register({ onValues: vi.fn() });
    runFrames();
    expect(overlayRoot()).toBeNull();
  });

  it('draws the hover outline on every element holding the hovered address, without a name', () => {
    const { editor } = start();
    const one = at(marked('title'), rect(10, 50));
    const two = at(marked('title'), rect(10, 200));
    marked('other');
    fromEditor(editor, outlineMessage({ address: 'title' }, null));
    runFrames();
    const boxes = drawn('hover') as HTMLElement[];
    expect(boxes.map((box) => box.style.top)).toEqual(['50px', '200px']);
    expect(boxes[0]?.textContent).toBe('');
    expect(rects.has(one) && rects.has(two)).toBe(true);
    expect(drawn('active')).toHaveLength(0);
  });

  it('draws the active outline with an aria-hidden tab holding the name', () => {
    const { editor } = start();
    at(marked('title'), rect(10, 50));
    fromEditor(
      editor,
      outlineMessage(null, { address: 'title', name: 'Title' })
    );
    runFrames();
    const [box] = drawn('active') as HTMLElement[];
    expect(box?.style.top).toBe('50px');
    const tab = box?.querySelector('[data-outline-tab]');
    expect(tab?.textContent).toBe('Title');
    expect(tab?.getAttribute('aria-hidden')).toBe('true');
  });

  it('puts the name tab above the element, and below it when there is no room above', () => {
    const { editor } = start();
    const title = at(marked('title'), rect(0, 100, 100, 40));
    const tabStyle = () =>
      (overlayRoot()?.querySelector('[data-outline-tab]') as HTMLElement).style;
    fromEditor(editor, outlineMessage(null, { address: 'title', name: 'T' }));
    runFrames();
    expect(tabStyle().bottom).toBe('100%');
    expect(tabStyle().top).toBe('');
    at(title, rect(0, 4, 100, 16));
    fromEditor(editor, outlineMessage(null, { address: 'title', name: 'T' }));
    scrollAndDraw();
    expect(tabStyle().top).not.toBe('');
    expect(tabStyle().bottom).toBe('');
  });

  it('active takes the innermost element and never reads blocks.1 as holding blocks.10', () => {
    const { editor } = start();
    const block = at(marked('blocks.1'), rect(0, 10));
    const text = at(marked('blocks.1.text', { parent: block }), rect(0, 300));
    const tenth = at(marked('blocks.10.text'), rect(0, 600));
    const active = (address: string) => {
      fromEditor(editor, outlineMessage(null, { address, name: 'x' }));
      runFrames();
      return (drawn('active') as HTMLElement[]).map((box) => box.style.top);
    };
    expect(active('blocks.1.text')).toEqual(['300px']);
    expect(active('blocks.1')).toEqual(['10px']);
    expect(active('blocks.1.text.deep')).toEqual(['300px']);
    expect(active('blocks.10')).toEqual([]);
    expect(active('blocks.10.text')).toEqual(['600px']);
    expect(active('blocks.2.text')).toEqual([]);
    expect(active('missing')).toEqual([]);
    expect([block, text, tenth]).toHaveLength(3);
  });

  it('matches documents: the element attribute, else the main declared document', async () => {
    const { editor, bridge } = start();
    bridge.register({ document: 'nav.json', shared: true, onValues: vi.fn() });
    bridge.register({ document: 'post.md', onValues: vi.fn() });
    at(marked('title'), rect(0, 10));
    at(marked('title', { document: 'nav.json' }), rect(0, 70));
    const top = (mark: { address: string; document?: string }) => {
      fromEditor(editor, outlineMessage(mark, null));
      runFrames();
      return (drawn('hover') as HTMLElement[]).map((box) => box.style.top);
    };
    expect(top({ address: 'title', document: 'post.md' })).toEqual(['10px']);
    expect(top({ address: 'title', document: 'nav.json' })).toEqual(['70px']);
    expect(top({ address: 'title' })).toEqual([]);
    await flush();
  });

  it('a mark without a document matches elements on a page that declared nothing', () => {
    const { editor, bridge } = start();
    bridge.register({ onValues: vi.fn() });
    at(marked('title'), rect(0, 10));
    fromEditor(editor, outlineMessage({ address: 'title' }, null));
    runFrames();
    expect(drawn('hover')).toHaveLength(1);
  });

  it('tie goes to the last clicked element, else the first in order', () => {
    const { editor } = startAnswered();
    const first = at(marked('title'), rect(0, 10));
    const second = at(marked('title'), rect(0, 90));
    const tops = () => {
      fromEditor(editor, outlineMessage(null, { address: 'title', name: 'T' }));
      runFrames();
      return (drawn('active') as HTMLElement[]).map((box) => box.style.top);
    };
    expect(tops()).toEqual(['10px']);
    second.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true })
    );
    runFrames();
    expect(tops()).toEqual(['90px']);
    expect(first).not.toBe(second);
  });

  it('draws no hover over the active element and the host ignores the pointer', () => {
    const { editor } = start();
    at(marked('title'), rect(0, 10));
    fromEditor(
      editor,
      outlineMessage({ address: 'title' }, { address: 'title', name: 'T' })
    );
    runFrames();
    expect(drawn('hover')).toHaveLength(0);
    expect(drawn('active')).toHaveLength(1);
    const host = document.body.lastElementChild as HTMLElement;
    expect(host.style.pointerEvents).toBe('none');
    expect(host.style.position).toBe('fixed');
  });

  it('draws the host again after the page removed it and drops an outline whose element is gone', () => {
    const { editor } = start();
    const title = at(marked('title'), rect(0, 10));
    fromEditor(editor, outlineMessage({ address: 'title' }, null));
    runFrames();
    document.body.lastElementChild?.remove();
    expect(overlayRoot()).toBeNull();
    fromEditor(editor, outlineMessage({ address: 'title' }, null));
    runFrames();
    expect(drawn('hover')).toHaveLength(1);
    title.remove();
    fromEditor(editor, outlineMessage({ address: 'title' }, null));
    runFrames();
    expect(drawn('hover')).toHaveLength(0);
  });

  it('scrolls a newly active element that is outside the viewport into view, but not one in view', () => {
    const { editor } = start();
    const far = at(marked('far'), rect(0, 5000));
    const near = at(marked('near'), rect(0, 10));
    const scrollFar = vi.fn();
    const scrollNear = vi.fn();
    far.scrollIntoView = scrollFar;
    near.scrollIntoView = scrollNear;
    fromEditor(editor, outlineMessage(null, { address: 'near', name: 'n' }));
    runFrames();
    expect(scrollNear).not.toHaveBeenCalled();
    fromEditor(editor, outlineMessage(null, { address: 'far', name: 'f' }));
    runFrames();
    expect(scrollFar).toHaveBeenCalledWith({ block: 'nearest' });
  });

  it('does not scroll for a change that came from a click in the page', () => {
    const { editor } = startAnswered();
    const far = at(marked('far'), rect(0, 5000));
    far.scrollIntoView = vi.fn();
    far.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true })
    );
    fromEditor(editor, outlineMessage(null, { address: 'far', name: 'f' }));
    runFrames();
    expect(far.scrollIntoView).not.toHaveBeenCalled();
  });

  it("redraws on scroll and ignores the overlay host's own mutations", () => {
    const { editor } = start();
    const title = at(marked('title'), rect(0, 10));
    fromEditor(editor, outlineMessage({ address: 'title' }, null));
    runFrames();
    at(title, rect(0, 400));
    window.dispatchEvent(new Event('scroll'));
    runFrames();
    expect((drawn('hover') as HTMLElement[])[0]?.style.top).toBe('400px');
  });

  it('ignores outlines from the wrong origin or window', () => {
    const { editor } = start();
    marked('title');
    fromEditor(
      editor,
      outlineMessage({ address: 'title' }, null),
      'https://evil.example'
    );
    fromEditor(fakeEditor(), outlineMessage({ address: 'title' }, null));
    runFrames();
    expect(overlayRoot()).toBeNull();
  });
});

describe('pointer hover', () => {
  const point = (
    target: Element,
    pointerType: string,
    type = 'pointermove'
  ) => {
    const event = new MouseEvent(type, { bubbles: true });
    Object.defineProperty(event, 'pointerType', { value: pointerType });
    target.dispatchEvent(event);
  };

  it('outlines the innermost marked element under a mouse or pen and clears when it leaves', () => {
    startAnswered();
    const outer = marked('blocks.0');
    const inner = marked('blocks.0.text', { parent: outer });
    const plain = document.createElement('p');
    document.body.append(plain);
    point(inner, 'mouse');
    runFrames();
    expect(drawn('hover')).toHaveLength(1);
    point(plain, 'pen');
    runFrames();
    expect(drawn('hover')).toHaveLength(0);
    point(inner, 'pen');
    runFrames();
    expect(drawn('hover')).toHaveLength(1);
    point(inner, 'mouse', 'pointerout');
    runFrames();
    expect(drawn('hover')).toHaveLength(0);
  });

  it('outlines the element already under the pointer when the editor first answers', () => {
    const { editor } = start();
    const title = marked('title');
    point(title, 'mouse');
    Object.defineProperty(document, 'elementFromPoint', {
      configurable: true,
      value: () => title,
    });
    runFrames();
    expect(overlayRoot()).toBeNull();
    fromEditor(editor, outlineMessage(null, null));
    runFrames();
    expect(drawn('hover')).toHaveLength(1);
    Reflect.deleteProperty(document, 'elementFromPoint');
  });

  it('draws no hover for touch (a tap is a click)', () => {
    const { editor } = startAnswered();
    const title = marked('title');
    point(title, 'touch');
    runFrames();
    expect(drawn('hover')).toHaveLength(0);
    title.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true })
    );
    expect(editor.postMessage).toHaveBeenLastCalledWith(
      activateMessage('title'),
      window.origin
    );
    fromEditor(
      editor,
      outlineMessage(null, { address: 'title', name: 'Title' })
    );
    runFrames();
    expect(drawn('active')).toHaveLength(1);
  });
});
