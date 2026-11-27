import { describe, expect, it } from 'vitest';
import {
  type CollectedForm,
  addForm,
  renderFormPayload,
  renderPageFormPayloads,
  sortByPriority,
} from './form-payload';

function makeForm(overrides: Partial<CollectedForm> = {}): CollectedForm {
  return {
    id: 'id',
    query: 'query Q',
    variables: {},
    data: {},
    ...overrides,
  };
}

function readPayloads(html: string): Element[] {
  const template = document.createElement('template');
  template.innerHTML = html;
  return Array.from(template.content.querySelectorAll('[data-tina-form]'));
}

describe('addForm', () => {
  it('dedupes by id', () => {
    const forms: CollectedForm[] = [];
    addForm(forms, makeForm({ id: 'a' }));
    addForm(forms, makeForm({ id: 'a' }));
    addForm(forms, makeForm({ id: 'b' }));
    expect(forms.map((f) => f.id)).toEqual(['a', 'b']);
  });

  it('upgrades an existing entry to primary when a later call asserts it', () => {
    const forms: CollectedForm[] = [];
    addForm(forms, makeForm({ id: 'global' }));
    addForm(forms, makeForm({ id: 'global', priority: 'primary' }));
    expect(forms).toHaveLength(1);
    expect(forms[0]!.priority).toBe('primary');
  });

  it('never downgrades a primary entry', () => {
    const forms: CollectedForm[] = [];
    addForm(forms, makeForm({ id: 'post', priority: 'primary' }));
    addForm(forms, makeForm({ id: 'post' }));
    expect(forms[0]!.priority).toBe('primary');
  });
});

describe('sortByPriority', () => {
  it('moves primaries to the front while preserving relative order', () => {
    const forms = [
      makeForm({ id: 'a' }),
      makeForm({ id: 'b', priority: 'primary' }),
      makeForm({ id: 'c' }),
      makeForm({ id: 'd', priority: 'primary' }),
    ];
    expect(sortByPriority(forms).map((f) => f.id)).toEqual([
      'b',
      'd',
      'a',
      'c',
    ]);
  });

  it('returns a new array without mutating the input', () => {
    const forms = [makeForm({ id: 'a' }), makeForm({ id: 'b' })];
    const sorted = sortByPriority(forms);
    expect(sorted).not.toBe(forms);
    expect(forms.map((f) => f.id)).toEqual(['a', 'b']);
  });
});

describe('renderFormPayload', () => {
  it('round-trips the form through an escaped attribute', () => {
    const form = makeForm({
      id: 'x',
      data: { title: `"quotes" & <tags> 'apostrophes'` },
    });
    const [element] = readPayloads(renderFormPayload(form, false));
    expect(element!.tagName).toBe('DIV');
    expect(element!.hasAttribute('hidden')).toBe(true);
    expect(element!.hasAttribute('data-tina-primary')).toBe(false);
    expect(JSON.parse(element!.getAttribute('data-tina-form')!)).toEqual(form);
  });

  it('marks the primary form and can render a template element', () => {
    const html = renderFormPayload(makeForm(), true, 'template');
    expect(html.startsWith('<template data-tina-form="')).toBe(true);
    expect(html).toContain(' data-tina-primary hidden></template>');
  });
});

describe('renderPageFormPayloads', () => {
  it('marks only the first form as primary when none asserts priority', () => {
    const elements = readPayloads(
      renderPageFormPayloads([makeForm({ id: 'page' }), makeForm({ id: 'g' })])
    );
    expect(elements.map((e) => e.hasAttribute('data-tina-primary'))).toEqual([
      true,
      false,
    ]);
  });

  it('puts an explicit primary first', () => {
    const elements = readPayloads(
      renderPageFormPayloads([
        makeForm({ id: 'global' }),
        makeForm({ id: 'post', priority: 'primary' }),
      ])
    );
    expect(
      elements.map((e) => JSON.parse(e.getAttribute('data-tina-form')!).id)
    ).toEqual(['post', 'global']);
    expect(elements[0]!.hasAttribute('data-tina-primary')).toBe(true);
  });

  it('renders nothing without forms', () => {
    expect(renderPageFormPayloads([], 'template')).toBe('');
  });
});
