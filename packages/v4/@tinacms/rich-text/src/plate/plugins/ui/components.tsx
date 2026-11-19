import { withProps } from '@udecode/cn';
import {
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
} from '@udecode/plate-basic-marks/react';
import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import {
  CodeBlockPlugin,
  CodeLinePlugin,
  CodeSyntaxPlugin,
} from '@udecode/plate-code-block/react';
import { HEADING_KEYS } from '@udecode/plate-heading';
import { HighlightPlugin } from '@udecode/plate-highlight/react';
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react';
import { LinkPlugin } from '@udecode/plate-link/react';
import {
  BulletedListPlugin,
  ListItemPlugin,
  NumberedListPlugin,
} from '@udecode/plate-list/react';
import { SlashInputPlugin } from '@udecode/plate-slash-command/react';
import {
  TableCellHeaderPlugin,
  TableCellPlugin,
  TablePlugin,
  TableRowPlugin,
} from '@udecode/plate-table/react';
import { ParagraphPlugin, PlateLeaf } from '@udecode/plate/react';
import colorString from 'color-string';
import { Lock } from 'lucide-react';
import React from 'react';
import { BlockquoteElement } from '../../components/plate-ui/blockquote-element';
import { CodeBlockElement } from '../../components/plate-ui/code-block/code-block-element';
import { CodeLeaf } from '../../components/plate-ui/code-leaf';
import { CodeLineElement } from '../../components/plate-ui/code-line-element';
import { CodeSyntaxLeaf } from '../../components/plate-ui/code-syntax-leaf';
import { HrElement } from '../../components/plate-ui/hr-element';
import { LinkElement } from '../../components/plate-ui/link-element';
import { ListElement } from '../../components/plate-ui/list-element';
import { ListItemElement } from '../../components/list-item-element';
import { ParagraphElement } from '../../components/plate-ui/paragraph-element';
import { SlashInputElement } from '../../components/plate-ui/slash-input-element';
import {
  TableCellElement,
  TableCellHeaderElement,
} from '../../components/plate-ui/table/table-cell-element';
import { TableElement } from '../../components/plate-ui/table/table-element';
import { TableRowElement } from '../../components/plate-ui/table/table-row-element';
import { TextColorPlugin } from '../text-color-plugin';
import { classNames } from './helpers';

function getContrastColor(color: string): string {
  const parsed = colorString.get.rgb(color);
  if (!parsed) return '#000000';
  const [r, g, b] = parsed;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

// Mirrors `isSafeCssColor` in @tinacms/mdx (src/sanitize-css-color.ts); this
// package keeps a copy so it doesn't depend on @tinacms/mdx.
const COLOR_FUNCTIONS = new Set([
  'rgb',
  'rgba',
  'hsl',
  'hsla',
  'hwb',
  'lab',
  'lch',
  'oklab',
  'oklch',
  'color',
  'color-mix',
  'light-dark',
  'calc',
  'var',
]);

const isSafeColorFunction = (value: string) => {
  if (!/^[a-z-]+\([a-z0-9_.,%/#() +-]*\)$/i.test(value)) {
    return false;
  }
  let depth = 0;
  for (const [token, name = ''] of value.matchAll(/([a-z-]*)\(|\)/gi)) {
    if (token === ')') {
      depth--;
    } else if (COLOR_FUNCTIONS.has(name.toLowerCase())) {
      depth++;
    } else {
      return false;
    }
    if (depth < 0) {
      return false;
    }
  }
  return depth === 0;
};

/** True when `value` is a plain CSS colour that's safe to put in a `style`. */
export const isSafeCssColor = (value: string) => {
  const trimmed = value.trim();
  const color = trimmed.toLowerCase().endsWith('!important')
    ? trimmed.slice(0, -'!important'.length).trimEnd()
    : trimmed;
  return (
    /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(color) ||
    /^[a-z]+$/i.test(color) ||
    isSafeColorFunction(color)
  );
};

/**
 * Reads a colour leaf prop (leaf props are untyped in Plate), dropping values
 * that aren't a plain CSS colour so pasted/loaded content can't inject CSS.
 */
const leafColor = (value: unknown) =>
  typeof value === 'string' && isSafeCssColor(value) ? value : undefined;

// Bold/italic/etc. nested inside a colour leaf get their colour from the
// editor's prose styles; make them inherit the leaf's colour instead.
const INHERIT_NESTED_COLOR =
  '[&_strong]:text-inherit [&_em]:text-inherit [&_s]:text-inherit [&_u]:text-inherit';

const HighlightLeaf = ({
  leaf,
  ...props
}: React.ComponentProps<typeof PlateLeaf>) => {
  const backgroundColor = leafColor(leaf.highlightColor) ?? '#FEF08A';
  // An explicit text colour wins over the auto-contrast colour, so the
  // result doesn't depend on which leaf Plate nests outermost.
  const color = leafColor(leaf.textColor) ?? getContrastColor(backgroundColor);
  return (
    <PlateLeaf
      as='mark'
      className={`rounded-xs ${INHERIT_NESTED_COLOR}`}
      style={{ backgroundColor, color }}
      leaf={leaf}
      {...props}
    />
  );
};

const TextColorLeaf = ({
  leaf,
  ...props
}: React.ComponentProps<typeof PlateLeaf>) => (
  <PlateLeaf
    as='span'
    className={INHERIT_NESTED_COLOR}
    style={{ color: leafColor(leaf.textColor) }}
    leaf={leaf}
    {...props}
  />
);

type HeadingComponentProps = {
  attributes: React.HTMLAttributes<HTMLHeadingElement>;
  children: React.ReactNode;
  className?: string;
};

const headingBase =
  'mb-3 mt-6 font-heading font-semibold text-foreground first:mt-0 last:mb-0';

const createHeading = (
  Tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6',
  scale: string
) => {
  const Heading = ({
    attributes,
    children,
    className,
  }: HeadingComponentProps) => (
    <Tag {...attributes} className={classNames(headingBase, scale, className)}>
      {children}
    </Tag>
  );
  return Heading;
};

const Heading1 = createHeading('h1', 'text-[1.75rem] leading-9');
const Heading2 = createHeading('h2', 'text-lg leading-7');
const Heading3 = createHeading('h3', 'text-md leading-6');
const Heading4 = createHeading('h4', 'text-base leading-6');
const Heading5 = createHeading(
  'h5',
  'text-base leading-6 text-muted-foreground'
);
const Heading6 = createHeading('h6', 'text-sm leading-5 text-muted-foreground');

const LOCK_ICON = <Lock aria-hidden className='size-3.5 shrink-0' />;

export const RAW_HTML_NAME = 'Raw HTML, edit it in the file';

const RawHtmlBlock = ({
  attributes,
  element,
  children,
  className,
}: {
  attributes: React.HTMLAttributes<HTMLDivElement>;
  element: { value?: unknown };
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    {...attributes}
    role='group'
    aria-label={RAW_HTML_NAME}
    className={classNames(
      'mb-3 flex cursor-not-allowed items-start gap-2 rounded-sm border border-border-subtle bg-muted px-3 py-2 font-mono text-sm text-muted-foreground last:mb-0',
      className
    )}
  >
    <span contentEditable={false} className='mt-0.5'>
      {LOCK_ICON}
    </span>
    <span className='min-w-0 flex-1 whitespace-pre-wrap break-words'>
      {children}
      {String(element.value ?? '')}
    </span>
  </div>
);

const RawHtmlChip = ({
  attributes,
  element,
  children,
  className,
}: {
  attributes: React.HTMLAttributes<HTMLSpanElement>;
  element: { value?: unknown };
  children: React.ReactNode;
  className?: string;
}) => (
  <span
    {...attributes}
    role='group'
    aria-label={RAW_HTML_NAME}
    className={classNames(
      'inline-flex cursor-not-allowed items-center gap-1 rounded-xs bg-muted px-1 py-0.5 align-baseline font-mono text-[0.9em] text-muted-foreground',
      className
    )}
  >
    <span contentEditable={false}>{LOCK_ICON}</span>
    <span>
      {children}
      {String(element.value ?? '')}
    </span>
  </span>
);

export const Components = () => {
  return {
    [SlashInputPlugin.key]: SlashInputElement,
    [HEADING_KEYS.h1]: Heading1,
    [HEADING_KEYS.h2]: Heading2,
    [HEADING_KEYS.h3]: Heading3,
    [HEADING_KEYS.h4]: Heading4,
    [HEADING_KEYS.h5]: Heading5,
    [HEADING_KEYS.h6]: Heading6,
    [ParagraphPlugin.key]: ParagraphElement,
    [BlockquotePlugin.key]: BlockquoteElement,
    [CodeBlockPlugin.key]: CodeBlockElement,
    [CodeLinePlugin.key]: CodeLineElement,
    [CodeSyntaxPlugin.key]: CodeSyntaxLeaf,
    html: RawHtmlBlock,
    html_inline: RawHtmlChip,
    [BulletedListPlugin.key]: withProps(ListElement, { variant: 'ul' }),
    [NumberedListPlugin.key]: withProps(ListElement, { variant: 'ol' }),
    [ListItemPlugin.key]: ListItemElement,
    [LinkPlugin.key]: LinkElement,
    [CodePlugin.key]: CodeLeaf,
    [HighlightPlugin.key]: HighlightLeaf,
    [TextColorPlugin.key]: TextColorLeaf,
    [UnderlinePlugin.key]: withProps(PlateLeaf, { as: 'u' }),
    [StrikethroughPlugin.key]: withProps(PlateLeaf, { as: 's' }),
    [ItalicPlugin.key]: withProps(PlateLeaf, { as: 'em' }),
    [BoldPlugin.key]: withProps(PlateLeaf, { as: 'strong' }),
    [HorizontalRulePlugin.key]: HrElement,
    [TableCellHeaderPlugin.key]: TableCellHeaderElement,
    [TableCellPlugin.key]: TableCellElement,
    [TablePlugin.key]: TableElement,
    [TableRowPlugin.key]: TableRowElement,
  };
};
