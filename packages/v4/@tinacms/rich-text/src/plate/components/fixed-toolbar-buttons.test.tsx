import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { TRange, Value } from '@udecode/plate';
import { Plate, PlateContent, usePlateEditor } from '@udecode/plate/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createEditorPlugins } from '../plugins/editor-plugins';
import { Components } from '../plugins/ui/components';
import type { MdxTemplate } from '../types';
import type { ToolbarOverrides } from '../toolbar/toolbar-overrides';
import { ToolbarProvider } from '../toolbar/toolbar-provider';
import FixedToolbarButtons from './fixed-toolbar-buttons';
import { TooltipProvider } from './plate-ui/tooltip';

const template = (name: string): MdxTemplate => ({
  name,
  label: name,
  key: name,
  fields: [],
});

const paragraphValue: Value = [
  { type: 'p', children: [{ text: 'plain' }] },
  { type: 'h2', children: [{ text: 'heading' }] },
  { type: 'p', children: [{ text: 'bold', bold: true }] },
];

const cell = (text: string) => ({
  type: 'td',
  children: [{ type: 'p', children: [{ text }] }],
});
const tableValue: Value = [
  {
    type: 'table',
    children: [{ type: 'tr', children: [cell('a'), cell('b')] }],
  },
];

const at = (path: number[]): TRange => ({
  anchor: { path, offset: 0 },
  focus: { path, offset: 0 },
});

const widths = new Map<Element, number>();

const observed: Array<{ target: Element; fire: () => void }> = [];

class FakeResizeObserver {
  constructor(private callback: ResizeObserverCallback) {}
  private notify(target: Element) {
    this.callback(
      [
        {
          target,
          contentRect: { width: widths.get(target) ?? 1200 } as DOMRectReadOnly,
        } as ResizeObserverEntry,
      ],
      this as unknown as ResizeObserver
    );
  }
  observe(target: Element) {
    observed.push({ target, fire: () => this.notify(target) });
    this.notify(target);
  }
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', FakeResizeObserver);
});
afterEach(() => {
  vi.unstubAllGlobals();
  widths.clear();
  observed.length = 0;
});

let lastEditor: ReturnType<typeof usePlateEditor> | undefined;

const Harness = ({
  value = paragraphValue,
  selection,
  overrides,
  templates = [],
  readOnly = false,
  disabled = false,
}: {
  value?: Value;
  selection?: TRange;
  overrides?: ToolbarOverrides;
  templates?: MdxTemplate[];
  readOnly?: boolean;
  disabled?: boolean;
}) => {
  const editor = usePlateEditor({
    plugins: createEditorPlugins({ headingLevels: overrides?.headingLevels }),
    value,
    selection,
    components: Components(),
  });
  lastEditor = editor;
  return (
    <TooltipProvider>
      <ToolbarProvider templates={templates} overrides={overrides}>
        <Plate editor={editor} readOnly={readOnly}>
          <FixedToolbarButtons disabled={disabled} />
          <PlateContent tabIndex={0} />
        </Plate>
      </ToolbarProvider>
    </TooltipProvider>
  );
};

const toolbar = () => screen.getByRole('toolbar', { name: 'Formatting' });
const names = () =>
  within(toolbar())
    .getAllByRole('button')
    .map((button) => button.getAttribute('aria-label') ?? button.textContent);

describe('the Formatting toolbar slots', () => {
  it('draws the text style, in-line tools, More formatting and Insert in order', () => {
    render(<Harness templates={[template('Callout')]} />);

    expect(names()).toEqual([
      'Text style: Paragraph',
      'Bold',
      'Italic',
      'Link',
      'Bulleted list',
      'Numbered list',
      'Quote',
      'More formatting',
      'Insert',
    ]);
  });

  it('shows only the allowed tools, placed by kind and not by override order', () => {
    render(<Harness overrides={{ toolbar: ['hr', 'bold', 'quote'] }} />);

    expect(names()).toEqual(['Bold', 'Quote', 'Insert']);
  });

  it('draws no Insert, More formatting or divider for Bold alone', () => {
    render(<Harness overrides={{ toolbar: ['bold'] }} />);

    expect(names()).toEqual(['Bold']);
    expect(within(toolbar()).queryByRole('separator')).toBeNull();
  });

  it('ignores an unknown key', () => {
    render(<Harness overrides={{ toolbar: ['bold', 'nope' as never] }} />);

    expect(names()).toEqual(['Bold']);
  });

  it('draws no toolbar for an empty allow-list', () => {
    render(<Harness overrides={{ toolbar: [] }} />);

    expect(screen.queryByRole('toolbar')).toBeNull();
  });
});

describe('folding into More tools', () => {
  it('folds Quote first, then the lists, as the toolbar narrows', async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      'ResizeObserver',
      class extends FakeResizeObserver {
        observe(target: Element) {
          widths.set(target, 330);
          super.observe(target);
        }
      }
    );
    render(<Harness />);

    expect(names()).not.toContain('Quote');
    expect(names()).toContain('More tools...');
    expect(names()).toContain('More formatting');
    expect(names()).toContain('Insert');

    await user.click(screen.getByRole('button', { name: 'More tools...' }));
    expect(
      await screen.findByRole('button', { name: 'Quote' })
    ).toBeInTheDocument();
  });

  it('counts the divider before More tools when More formatting is off, so Insert is not clipped', () => {
    vi.stubGlobal(
      'ResizeObserver',
      class extends FakeResizeObserver {
        observe(target: Element) {
          widths.set(target, 192);
          super.observe(target);
        }
      }
    );
    render(
      <Harness
        overrides={{ toolbar: ['bold', 'italic', 'link', 'ul', 'table'] }}
      />
    );

    expect(names()).toEqual(['Bold', 'More tools...', 'Insert']);
  });

  it('shows no More tools when everything fits', () => {
    render(<Harness />);

    expect(names()).not.toContain('More tools...');
  });
});

describe('pressed state', () => {
  it('presses Bold with the caret in bold text and not in plain text', () => {
    const { unmount } = render(<Harness selection={at([2, 0])} />);
    expect(screen.getByRole('button', { name: 'Bold' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    unmount();

    render(<Harness selection={at([0, 0])} />);
    expect(screen.getByRole('button', { name: 'Bold' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  });

  it('never gives Link aria-pressed', () => {
    render(<Harness />);

    expect(screen.getByRole('button', { name: 'Link' })).not.toHaveAttribute(
      'aria-pressed'
    );
  });

  it('names the current style on the text style trigger', () => {
    render(<Harness selection={at([1, 0])} />);

    expect(
      screen.getByRole('button', { name: 'Text style: Heading 2' })
    ).toBeInTheDocument();
  });
});

describe('keyboard', () => {
  it('has one Tab stop and the arrow keys, Home and End move between tools', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const buttons = within(toolbar()).getAllByRole('button');

    expect(buttons.filter((b) => b.tabIndex === 0)).toHaveLength(1);

    await user.tab();
    expect(buttons[0]).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(buttons[1]).toHaveFocus();
    await waitFor(() => expect(buttons[1].tabIndex).toBe(0));
    expect(buttons[0].tabIndex).toBe(-1);
    await user.keyboard('{End}');
    expect(buttons.at(-1)).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(buttons[0]).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(buttons.at(-1)).toHaveFocus();
    await user.keyboard('{Home}');
    expect(buttons[0]).toHaveFocus();
  });

  it('returns focus to the trigger on Escape from More formatting', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const trigger = screen.getByRole('button', { name: 'More formatting' });

    trigger.focus();
    await user.keyboard('{Enter}');
    expect(await screen.findByRole('menu')).toBeInTheDocument();
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('menu')).toBeNull();
  });
});

describe('text style menu', () => {
  it('lists radio rows limited by headingLevels with the current one checked', async () => {
    const user = userEvent.setup();
    render(
      <Harness
        overrides={{ headingLevels: ['h2', 'h3'] }}
        selection={at([1, 0])}
      />
    );

    await user.click(
      screen.getByRole('button', { name: 'Text style: Heading 2' })
    );
    const rows = await screen.findAllByRole('menuitemradio');

    expect(rows.map((row) => row.textContent)).toEqual([
      'Paragraph',
      'Heading 2',
      'Heading 3',
    ]);
    expect(rows[1]).toHaveAttribute('aria-checked', 'true');
  });
});

describe('Insert menu', () => {
  it('lists templates, a separator, then the inserts', async () => {
    const user = userEvent.setup();
    render(<Harness templates={[template('Callout'), template('Hero')]} />);

    await user.click(screen.getByRole('button', { name: 'Insert' }));
    const menu = await screen.findByRole('menu', { name: 'Insert' });

    expect(
      within(menu)
        .getAllByRole('menuitem')
        .map((item) => item.textContent)
    ).toEqual([
      'Callout',
      'Hero',
      'Image',
      'Table',
      'Code block',
      'Mermaid',
      'Horizontal rule',
    ]);
    expect(within(menu).getAllByRole('separator')).toHaveLength(1);
    expect(
      within(menu).getByRole('menuitem', { name: 'Image' })
    ).toHaveAttribute('aria-disabled', 'true');
  });

  it('draws no separator without templates', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('button', { name: 'Insert' }));
    const menu = await screen.findByRole('menu', { name: 'Insert' });

    expect(within(menu).queryByRole('separator')).toBeNull();
  });

  it('shows no templates when embed is not allowed', async () => {
    const user = userEvent.setup();
    render(
      <Harness
        templates={[template('Callout')]}
        overrides={{ toolbar: ['hr'] }}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Insert' }));

    expect(screen.queryByRole('menuitem', { name: 'Callout' })).toBeNull();
  });

  it('filters templates only above ten', async () => {
    const user = userEvent.setup();
    const many = Array.from({ length: 11 }, (_, i) => template(`T${i}`));
    render(<Harness templates={many} />);

    await user.click(screen.getByRole('button', { name: 'Insert' }));
    await user.type(await screen.findByRole('searchbox'), 'T10');

    const menu = screen.getByRole('menu', { name: 'Insert' });
    expect(
      within(menu).getByRole('menuitem', { name: 'T10' })
    ).toBeInTheDocument();
    expect(within(menu).queryByRole('menuitem', { name: 'T1' })).toBeNull();
    expect(
      within(menu).getByRole('menuitem', { name: 'Mermaid' })
    ).toBeInTheDocument();
  });
});

describe('blocked tools', () => {
  it('disables lists, quote and the blocked inserts in a table cell but not Bold, Italic or Link', async () => {
    const user = userEvent.setup();
    render(<Harness value={tableValue} selection={at([0, 0, 0, 0, 0])} />);

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Quote' })).toBeDisabled()
    );
    for (const name of ['Bulleted list', 'Numbered list']) {
      expect(screen.getByRole('button', { name })).toBeDisabled();
    }
    for (const name of ['Bold', 'Italic', 'Link']) {
      expect(screen.getByRole('button', { name })).toBeEnabled();
    }

    await user.click(screen.getByRole('button', { name: 'Insert' }));
    const menu = await screen.findByRole('menu', { name: 'Insert' });
    for (const name of ['Code block', 'Mermaid', 'Horizontal rule']) {
      expect(within(menu).getByRole('menuitem', { name })).toHaveAttribute(
        'aria-disabled',
        'true'
      );
    }
    expect(
      within(menu).getByRole('menuitem', { name: 'Table' })
    ).not.toHaveAttribute('aria-disabled', 'true');
  });

  it('disables the heading rows of the text style menu in a table', async () => {
    const user = userEvent.setup();
    render(<Harness value={tableValue} selection={at([0, 0, 0, 0, 0])} />);

    await user.click(screen.getByRole('button', { name: /^Text style/ }));
    const rows = await screen.findAllByRole('menuitemradio');

    await waitFor(() =>
      expect(
        rows.filter((row) => row.getAttribute('aria-disabled') === 'true')
      ).not.toHaveLength(0)
    );
    expect(
      rows
        .filter((row) => row.getAttribute('aria-disabled') === 'true')
        .map((r) => r.textContent)
    ).toEqual([
      'Heading 1',
      'Heading 2',
      'Heading 3',
      'Heading 4',
      'Heading 5',
      'Heading 6',
    ]);
  });
});

describe('disabled', () => {
  it('turns every tool and menu trigger off and gives no Tab stop', async () => {
    const user = userEvent.setup();
    render(<Harness disabled />);

    const buttons = within(toolbar()).getAllByRole('button');
    for (const button of buttons) expect(button).toBeDisabled();
    await user.tab();
    expect(toolbar().contains(document.activeElement)).toBe(false);

    await user.click(screen.getByRole('button', { name: 'Insert' }));
    expect(screen.queryByRole('menu')).toBeNull();
  });
});

describe('swatches', () => {
  it('opens round chips with names and a Clear row for Highlight color', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('button', { name: 'More formatting' }));
    await user.click(
      await screen.findByRole('menuitem', { name: 'Highlight color' })
    );

    for (const name of ['Yellow', 'Green', 'Blue', 'Red']) {
      expect(await screen.findByRole('menuitem', { name })).toBeInTheDocument();
    }
    expect(
      screen.getByRole('menuitem', { name: 'Clear highlight' })
    ).toBeInTheDocument();
  });

  it('shows a developer palette for Text color and drops unsafe values', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const user = userEvent.setup();
    render(
      <Harness
        overrides={{
          textColors: [
            { label: 'Brand', value: '#123456' },
            { label: 'Bad', value: 'url(javascript:alert(1))' },
          ],
        }}
      />
    );

    await user.click(screen.getByRole('button', { name: 'More formatting' }));
    await user.click(
      await screen.findByRole('menuitem', { name: 'Text color' })
    );

    expect(
      await screen.findByRole('menuitem', { name: 'Brand' })
    ).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Bad' })).toBeNull();
    expect(
      screen.getByRole('menuitem', { name: 'Clear text color' })
    ).toBeInTheDocument();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});

describe('shortcuts and insertion', () => {
  const select = (start: number, end: number): TRange => ({
    anchor: { path: [0, 0], offset: start },
    focus: { path: [0, 0], offset: end },
  });

  it.each([
    ['{Control>}b{/Control}', 'bold'],
    ['{Control>}i{/Control}', 'italic'],
    ['{Control>}{Shift>}x{/Shift}{/Control}', 'strikethrough'],
    ['{Control>}e{/Control}', 'code'],
  ])('toggles the format on %s', async (keys, mark) => {
    const user = userEvent.setup();
    render(<Harness selection={select(0, 5)} />);
    await user.click(screen.getByRole('textbox'));
    lastEditor?.tf.select(select(0, 5));
    await user.keyboard(keys);

    expect(JSON.stringify(lastEditor?.children[0])).toContain(`"${mark}":true`);
  });

  it('inserts the Callout embed from Insert', async () => {
    const user = userEvent.setup();
    render(
      <Harness templates={[template('Callout')]} selection={select(0, 0)} />
    );

    await user.click(screen.getByRole('button', { name: 'Insert' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Callout' }));

    expect(JSON.stringify(lastEditor?.children)).toContain('Callout');
  });

  it('returns focus to the trigger on Escape', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const trigger = screen.getByRole('button', { name: 'More formatting' });

    trigger.focus();
    await user.keyboard('{Enter}');
    await screen.findByRole('menu');
    await user.keyboard('{Escape}');

    await waitFor(() => expect(trigger).toHaveFocus());
  });
});

describe('Text style on a list item', () => {
  it('turns a list item into a heading without its bullet', async () => {
    const user = userEvent.setup();
    const list: Value = [
      {
        type: 'ul',
        children: [
          {
            type: 'li',
            children: [{ type: 'lic', children: [{ text: 'item' }] }],
          },
        ],
      },
    ];
    render(<Harness value={list} selection={at([0, 0, 0, 0])} />);

    await user.click(screen.getByRole('button', { name: /^Text style/ }));
    await user.click(
      await screen.findByRole('menuitemradio', { name: 'Heading 2' })
    );

    const nodes = lastEditor?.children ?? [];
    expect(nodes[0]).toMatchObject({ type: 'h2' });
    expect(JSON.stringify(nodes)).not.toMatch(/"type":"(ul|ol|li|lic)"/);
    expect(JSON.stringify(nodes)).not.toContain('listStyleType');
  });

  it('leaves no list behind when the selection runs from a paragraph into a nested list', async () => {
    const user = userEvent.setup();
    const item = (text: string, nested?: Value[number]) => ({
      type: 'li',
      children: [
        { type: 'lic', children: [{ text }] },
        ...(nested ? [nested] : []),
      ],
    });
    const mixed: Value = [
      { type: 'p', children: [{ text: 'P' }] },
      {
        type: 'ul',
        children: [item('A', { type: 'ul', children: [item('B')] }), item('C')],
      },
    ];
    render(
      <Harness
        value={mixed}
        selection={{
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [1, 1, 0, 0], offset: 1 },
        }}
      />
    );

    await user.click(
      within(toolbar()).getByRole('button', { name: /^Text style/ })
    );
    await user.click(
      await screen.findByRole('menuitemradio', { name: 'Heading 1' })
    );

    const json = JSON.stringify(lastEditor?.children);
    expect(json).not.toMatch(/"type":"(ul|ol|li|lic)"/);
    expect(json).not.toContain('listStyleType');
    expect(lastEditor?.api.string([])).toContain('P');
    expect(lastEditor?.api.string([])).toContain('B');
  });
});

const narrow = (width: number) =>
  vi.stubGlobal(
    'ResizeObserver',
    class extends FakeResizeObserver {
      observe(target: Element) {
        widths.set(target, width);
        super.observe(target);
      }
    }
  );

const codeValue: Value = [
  { type: 'p', children: [{ text: 'plain' }] },
  {
    type: 'code_block',
    children: [{ type: 'code_line', children: [{ text: 'x = 1' }] }],
  },
];

const focusText = () => {
  act(() =>
    document.querySelector<HTMLElement>('[data-slate-editor]')?.focus()
  );
};

const linkBox = () => screen.queryByRole('textbox', { name: 'Link' });

describe('Cmd/Ctrl+K', () => {
  it('opens the link box with the selected words when Link is in line', async () => {
    const user = userEvent.setup();
    render(
      <Harness
        selection={{
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 5 },
        }}
      />
    );
    focusText();

    await user.keyboard('{Control>}k{/Control}');
    expect(
      await screen.findByRole('textbox', { name: 'Text to display' })
    ).toHaveValue('plain');
  });

  it('opens the same link box when Link is folded into More tools', async () => {
    const user = userEvent.setup();
    narrow(192);
    render(
      <Harness
        overrides={{ toolbar: ['bold', 'italic', 'link', 'ul', 'table'] }}
        selection={{
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 5 },
        }}
      />
    );
    expect(names()).not.toContain('Link');
    focusText();

    await user.keyboard('{Control>}k{/Control}');
    expect(
      await screen.findByRole('textbox', { name: 'Text to display' })
    ).toHaveValue('plain');
    expect(linkBox()).not.toBeNull();
    expect(document.querySelector('[data-quiet]')).toHaveAttribute(
      'aria-label',
      'More tools'
    );
  });

  it('does nothing in a code block, also after moving there once mounted', async () => {
    const user = userEvent.setup();
    render(<Harness value={codeValue} selection={at([0, 0])} />);
    focusText();
    act(() => lastEditor?.tf.select(at([1, 0, 0])));

    await user.keyboard('{Control>}k{/Control}');
    expect(linkBox()).toBeNull();
  });

  it('does nothing in a code block when Link is folded', async () => {
    const user = userEvent.setup();
    narrow(192);
    render(
      <Harness
        value={codeValue}
        overrides={{ toolbar: ['bold', 'italic', 'link', 'ul', 'table'] }}
        selection={at([0, 0])}
      />
    );
    focusText();
    act(() => lastEditor?.tf.select(at([1, 0, 0])));

    await user.keyboard('{Control>}k{/Control}');
    expect(linkBox()).toBeNull();
    expect(screen.queryByRole('button', { name: 'Link' })).toBeNull();
  });

  it('works again after leaving a code block', async () => {
    const user = userEvent.setup();
    render(<Harness value={codeValue} selection={at([1, 0, 0])} />);
    focusText();
    act(() => lastEditor?.tf.select(at([0, 0])));

    await user.keyboard('{Control>}k{/Control}');
    expect(await screen.findByRole('textbox', { name: 'Link' })).toBeVisible();
  });

  it('does nothing without link in overrides.toolbar', async () => {
    const user = userEvent.setup();
    render(
      <Harness overrides={{ toolbar: ['bold'] }} selection={at([0, 0])} />
    );
    focusText();

    await user.keyboard('{Control>}k{/Control}');
    expect(linkBox()).toBeNull();
  });

  it('does nothing when the field is disabled', async () => {
    const user = userEvent.setup();
    render(<Harness disabled selection={at([0, 0])} />);
    focusText();

    await user.keyboard('{Control>}k{/Control}');
    expect(linkBox()).toBeNull();
  });

  it('does nothing when the field is read-only', async () => {
    const user = userEvent.setup();
    render(<Harness readOnly selection={at([0, 0])} />);
    focusText();

    await user.keyboard('{Control>}k{/Control}');
    expect(linkBox()).toBeNull();
  });
});

const resizeTo = (width: number) => {
  act(() => {
    for (const { target, fire } of observed) {
      widths.set(target, width);
      fire();
    }
  });
};

describe('the quiet More tools panel after Cmd/Ctrl+K', () => {
  const folded = () => (
    <Harness
      overrides={{ toolbar: ['bold', 'italic', 'link', 'ul', 'table'] }}
      selection={{
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 5 },
      }}
    />
  );

  it('closes after Escape, and the next More tools click opens a visible panel', async () => {
    const user = userEvent.setup();
    narrow(192);
    render(folded());
    focusText();

    await user.keyboard('{Control>}k{/Control}');
    await screen.findByRole('textbox', { name: 'Link' });
    await user.keyboard('{Escape}');
    await waitFor(() => expect(linkBox()).toBeNull());
    expect(screen.queryByRole('dialog', { name: 'More tools' })).toBeNull();

    await user.click(screen.getByRole('button', { name: 'More tools...' }));
    expect(
      await screen.findByRole('dialog', { name: 'More tools' })
    ).toBeVisible();
  });

  it('is reset when Link stops being folded, so More tools does not come back open', async () => {
    const user = userEvent.setup();
    narrow(192);
    render(folded());
    focusText();

    await user.keyboard('{Control>}k{/Control}');
    await screen.findByRole('textbox', { name: 'Link' });
    resizeTo(1200);
    await waitFor(() => expect(names()).toContain('Link'));
    expect(document.querySelector('[data-quiet]')).toBeNull();

    resizeTo(192);
    await waitFor(() => expect(names()).toContain('More tools...'));
    expect(
      screen.getByRole('button', { name: 'More tools...' })
    ).toHaveAttribute('aria-expanded', 'false');
    expect(document.querySelector('[data-quiet]')).toBeNull();
  });
});

describe('Text style on an indent-list paragraph', () => {
  it('turns it into a heading and drops its bullet', async () => {
    const user = userEvent.setup();
    const bulleted: Value = [
      {
        type: 'p',
        indent: 1,
        listStyleType: 'disc',
        children: [{ text: 'item' }],
      },
    ];
    render(<Harness value={bulleted} selection={at([0, 0])} />);

    await user.click(
      within(toolbar()).getByRole('button', { name: /^Text style/ })
    );
    await user.click(
      await screen.findByRole('menuitemradio', { name: 'Heading 2' })
    );

    expect(lastEditor?.children[0]).toMatchObject({ type: 'h2' });
    expect(JSON.stringify(lastEditor?.children)).not.toContain('listStyleType');
  });
});
