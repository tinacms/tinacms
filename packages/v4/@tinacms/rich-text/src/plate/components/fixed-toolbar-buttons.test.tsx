import { render, screen, waitFor, within } from '@testing-library/react';
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

class FakeResizeObserver {
  constructor(private callback: ResizeObserverCallback) {}
  observe(target: Element) {
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
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', FakeResizeObserver);
});
afterEach(() => {
  vi.unstubAllGlobals();
  widths.clear();
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
          <PlateContent />
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
