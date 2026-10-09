// A preview element maps to a field, to one item of a list field, or (with
// `inner`) to the first field inside that item or group.
export interface Target {
  field: string;
  index?: number;
  inner?: boolean;
}

const FOCUSABLE =
  'input:not([type=hidden]), textarea, button, [contenteditable=true]';

const nextFrame = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

// One frame for the state change to render, one for the new level to mount.
const settle = async () => {
  await nextFrame();
  await nextFrame();
};

const fieldOf = (pane: HTMLElement, name: string) =>
  pane.querySelector<HTMLElement>(`[data-doc-field="${name}"]`);

const rowsOf = (field: Element) => [...field.querySelectorAll('ul > li')];

const firstControl = (field: HTMLElement) => {
  const labelFor = field.querySelector('label[for]')?.getAttribute('for');
  const labelled = labelFor ? document.getElementById(labelFor) : null;
  return labelled ?? field.querySelector<HTMLElement>(FOCUSABLE);
};

// Scrolls the editor pane only, so the preview and the page stay where they are.
function bringIntoView(pane: HTMLElement, element: HTMLElement) {
  const top =
    element.getBoundingClientRect().top -
    pane.getBoundingClientRect().top +
    pane.scrollTop;
  pane.scrollTo({ top: Math.max(0, top - pane.clientHeight / 3) });
  element.focus({ preventScroll: true });
}

const openIfClosed = async (toggle: HTMLElement | null | undefined) => {
  if (toggle?.getAttribute('aria-expanded') === 'false') {
    toggle.click();
    await settle();
  }
};

export async function reveal(pane: HTMLElement, target: Target) {
  const field = fieldOf(pane, target.field);
  if (!field) return;
  let element: HTMLElement | null | undefined;
  if (target.index !== undefined) {
    const header =
      rowsOf(field)[target.index]?.querySelector<HTMLElement>(
        '[data-row-main]'
      );
    if (target.inner) {
      await openIfClosed(header);
      element =
        rowsOf(field)[target.index]?.querySelector<HTMLElement>(
          'input, textarea'
        );
    } else {
      element = header;
    }
  } else if (target.inner) {
    await openIfClosed(
      field.querySelector<HTMLElement>('button[aria-expanded]')
    );
    element = field.querySelector<HTMLElement>('input, textarea');
  } else {
    element = firstControl(field);
  }
  if (element) bringIntoView(pane, element);
}

// The field or item that holds the element, as a preview key: "tags" or "tags:2".
export function targetOf(node: EventTarget): string | null {
  if (!(node instanceof Element)) return null;
  const field = node.closest('[data-doc-field]');
  const name = field?.getAttribute('data-doc-field');
  if (!field || !name) return null;
  const row = node.closest('li');
  const index = row ? rowsOf(field).indexOf(row) : -1;
  return index >= 0 ? `${name}:${index}` : name;
}

const PROBLEM =
  '[aria-invalid="true"], [data-closed-errors], [data-doc-field] [role="alert"]';

// Opens closed levels on the way to the first error in the pane, then focuses
// it. Returns false when there is no error.
export async function findProblem(pane: HTMLElement) {
  for (let level = 0; level < 8; level += 1) {
    await settle();
    const first = pane.querySelector<HTMLElement>(PROBLEM);
    if (!first) return false;
    if (first.hasAttribute('data-closed-errors')) {
      first.closest('button')?.click();
      continue;
    }
    const field = first.closest<HTMLElement>('[data-doc-field]');
    const element =
      first.getAttribute('role') === 'alert' && field
        ? firstControl(field)
        : first;
    if (element) bringIntoView(pane, element);
    return true;
  }
  return true;
}
