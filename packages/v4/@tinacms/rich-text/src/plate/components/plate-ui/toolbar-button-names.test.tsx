import { render, screen } from '@testing-library/react';
import type { TRange, Value } from '@udecode/plate';
import {
  BulletedListPlugin,
  NumberedListPlugin,
} from '@udecode/plate-list/react';
import { Plate, PlateContent, usePlateEditor } from '@udecode/plate/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { createEditorPlugins } from '../../plugins/editor-plugins';
import { Components } from '../../plugins/ui/components';
import { ToolbarProvider } from '../../toolbar/toolbar-provider';
import { HeadingsMenu } from '../headings-dropdown';
import { CodeBlockToolbarButton } from './code-block-toolbar-button';
import {
  ArrowDownIcon,
  BoldIcon,
  CodeBlockIcon,
  CodeIcon,
  HeadingIcon,
  Icons,
  ImageIcon,
  ItalicIcon,
  LightningIcon,
  LinkIcon,
  OrderedListIcon,
  QuoteIcon,
  StrikethroughIcon,
  UnderlineIcon,
  UnorderedListIcon,
} from './icons';
import { HorizontalRuleToolbarButton } from './hr-toolbar-button';
import { ImageToolbarButton } from './image-toolbar-button';
import { ListToolbarButton } from './indent-list-toolbar-button';
import { LinkToolbarButton } from './link-toolbar-button';
import {
  BoldToolbarButton,
  CodeToolbarButton,
  HighlightToolbarButton,
  ItalicToolbarButton,
  StrikethroughToolbarButton,
} from './mark-toolbar-button';
import { MermaidToolbarButton } from './mermaid-toolbar-button';
import OverflowMenu from './overflow-menu';
import { QuoteToolbarButton } from './quote-toolbar-button';
import { RawMarkdownToolbarButton } from './raw-markdown-toolbar-button';
import { TableDropdownMenu } from './table/table-dropdown-menu';
import TemplatesToolbarButton from './templates-toolbar-button';
import { Toolbar } from './toolbar';
import { TooltipProvider } from './tooltip';
import { TurnIntoDropdownMenu } from './turn-into-dropdown-menu';

const paragraphValue: Value = [{ type: 'p', children: [{ text: 'text' }] }];

const Harness = ({
  children,
  value = paragraphValue,
  selection,
}: {
  children?: React.ReactNode;
  value?: Value;
  selection?: TRange;
}) => {
  const editor = usePlateEditor({
    plugins: createEditorPlugins(),
    value,
    selection,
    components: Components(),
  });

  return (
    <TooltipProvider>
      <ToolbarProvider templates={[]} overrides={undefined}>
        <Plate editor={editor}>
          <Toolbar>{children}</Toolbar>
          <PlateContent />
        </Plate>
      </ToolbarProvider>
    </TooltipProvider>
  );
};

/**
 * The tooltip of a toolbar button is the label a sighted user reads. Radix puts
 * that text in `aria-describedby`, which is a description and never a name, so
 * the name of each button is asserted here against the same text.
 */
const ICON_ONLY_BUTTONS: ReadonlyArray<[string, React.ReactElement]> = [
  ['Link', <LinkToolbarButton key='link' />],
  ['Image', <ImageToolbarButton key='image' />],
  ['Horizontal Rule', <HorizontalRuleToolbarButton key='hr' />],
  ['Quote (⌘+⇧+.)', <QuoteToolbarButton key='quote' />],
  [
    'Bulleted List',
    <ListToolbarButton key='ul' nodeType={BulletedListPlugin.key} />,
  ],
  [
    'Numbered List',
    <ListToolbarButton key='ol' nodeType={NumberedListPlugin.key} />,
  ],
  ['Bold (⌘+B)', <BoldToolbarButton key='bold' />],
  ['Italic (⌘+I)', <ItalicToolbarButton key='italic' />],
  ['Strikethrough', <StrikethroughToolbarButton key='strikethrough' />],
  ['Code (⌘+E)', <CodeToolbarButton key='code' />],
  ['Highlight color', <HighlightToolbarButton key='highlight' />],
  ['Code Block', <CodeBlockToolbarButton key='code-block' />],
  ['Mermaid', <MermaidToolbarButton key='mermaid' />],
  ['Table', <TableDropdownMenu key='table' />],
  ['Raw Markdown', <RawMarkdownToolbarButton key='raw' />],
  [
    'More tools...',
    <OverflowMenu key='overflow'>
      <MermaidToolbarButton />
      <CodeBlockToolbarButton />
    </OverflowMenu>,
  ],
];

describe('the name a screen reader reads for an icon-only toolbar button', () => {
  it('holds every icon-only button of the toolbar', () => {
    expect(ICON_ONLY_BUTTONS).toHaveLength(16);
  });

  it.each(ICON_ONLY_BUTTONS)('reads "%s"', (name, button) => {
    render(<Harness>{button}</Harness>);

    expect(screen.getByRole('radio', { name })).toBeInTheDocument();
  });
});

describe('the name a screen reader reads for a toolbar button with text', () => {
  it('keeps the visible text of the Turn into button inside the name', () => {
    render(
      <Harness>
        <TurnIntoDropdownMenu />
      </Harness>
    );

    const button = screen.getByRole('radio', { name: 'Turn into Paragraph' });

    expect(button.textContent).toContain('Paragraph');
  });

  it('keeps the visible text of the Headings button inside the name', () => {
    render(
      <Harness>
        <HeadingsMenu />
      </Harness>
    );

    const button = screen.getByRole('radio', {
      name: 'Heading level: Paragraph',
    });

    expect(button.textContent).toContain('Paragraph');
  });

  it('keeps the visible text of the Embed button inside the name', () => {
    render(
      <Harness>
        <TemplatesToolbarButton />
      </Harness>
    );

    const button = screen.getByRole('radio', { name: 'Embed' });

    expect(button.textContent).toContain('Embed');
  });
});

/**
 * A control that holds an icon has its own name. An icon that keeps a `title`
 * adds a second name, which the reader hears after the first one.
 */
const DECORATIVE_ICONS: ReadonlyArray<[string, React.ElementType]> = [
  ['UnorderedListIcon', UnorderedListIcon],
  ['OrderedListIcon', OrderedListIcon],
  ['HeadingIcon', HeadingIcon],
  ['QuoteIcon', QuoteIcon],
  ['LinkIcon', LinkIcon],
  ['CodeIcon', CodeIcon],
  ['CodeBlockIcon', CodeBlockIcon],
  ['ImageIcon', ImageIcon],
  ['BoldIcon', BoldIcon],
  ['ItalicIcon', ItalicIcon],
  ['UnderlineIcon', UnderlineIcon],
  ['StrikethroughIcon', StrikethroughIcon],
  ['LightningIcon', LightningIcon],
  ['ArrowDownIcon', ArrowDownIcon],
  ['RawMarkdown', Icons.raw],
];

describe('an icon inside a control that has a name', () => {
  it('holds every icon that once carried a title', () => {
    expect(DECORATIVE_ICONS).toHaveLength(15);
  });

  it.each(DECORATIVE_ICONS)('adds nothing to the name: %s', (_label, Icon) => {
    render(
      <button type='button'>
        Insert
        <Icon />
      </button>
    );

    expect(screen.getByRole('button', { name: 'Insert' })).toBeInTheDocument();
  });
});

const cell = (text: string, colSpan?: number) => ({
  type: 'td',
  ...(colSpan ? { colSpan } : {}),
  children: [{ type: 'p', children: [{ text }] }],
});

const tableValue: Value = [
  {
    type: 'table',
    children: [
      { type: 'tr', children: [cell('a'), cell('b')] },
      { type: 'tr', children: [cell('c'), cell('d')] },
    ],
  },
];

const mergedTableValue: Value = [
  {
    type: 'table',
    children: [
      { type: 'tr', children: [cell('a', 2)] },
      { type: 'tr', children: [cell('c'), cell('d')] },
    ],
  },
];

const caretInFirstCell: TRange = {
  anchor: { path: [0, 0, 0, 0, 0], offset: 0 },
  focus: { path: [0, 0, 0, 0, 0], offset: 0 },
};

const twoCellsSelected: TRange = {
  anchor: { path: [0, 0, 0, 0, 0], offset: 0 },
  focus: { path: [0, 0, 1, 0, 0], offset: 1 },
};

const CELL_TOOLBAR_BUTTONS = [
  'Background color',
  'Cell borders',
  'Delete table',
  'Insert row before',
  'Insert row after',
  'Delete row',
  'Insert column before',
  'Insert column after',
  'Delete column',
];

describe('the name a screen reader reads for a table toolbar button', () => {
  it('holds every button the caret in a cell shows', () => {
    expect(CELL_TOOLBAR_BUTTONS).toHaveLength(9);
  });

  it.each(CELL_TOOLBAR_BUTTONS)('reads "%s"', async (name) => {
    render(<Harness value={tableValue} selection={caretInFirstCell} />);

    expect(await screen.findByRole('button', { name })).toBeInTheDocument();
  });

  it('reads "Split cell"', async () => {
    render(<Harness value={mergedTableValue} selection={caretInFirstCell} />);

    expect(
      await screen.findByRole('button', { name: 'Split cell' })
    ).toBeInTheDocument();
  });

  it('reads "Merge cells"', async () => {
    render(<Harness value={tableValue} selection={twoCellsSelected} />);

    expect(
      await screen.findByRole('button', { name: 'Merge cells' })
    ).toBeInTheDocument();
  });
});
