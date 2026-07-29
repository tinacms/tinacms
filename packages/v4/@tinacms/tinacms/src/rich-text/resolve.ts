// The walk over a rich-text tree, with no framework in it.
//
// v3 kept this switch inside a React component, so Astro had to rewrite the whole thing
// in `.astro` files to render the same content. Here the switch answers a question every
// binding asks — what does this node render as, and did the site supply a component for
// it — and a binding is left with the part that is genuinely its own: turning an
// instruction into an element.

import { sanitizeUrl } from '@tinacms/mdx/sanitize-url';
import type {
  RichTextChildren,
  RichTextInstruction,
  RichTextMark,
  RichTextMarkKey,
  RichTextNodeFields,
  RichTextProps,
  RichTextTableAlign,
  RichTextTableCell,
  SuppliedComponents,
  TinaMarkdownContent,
} from './types';

// Presence, not lookup. Matches the truthiness check the v3 renderer made, so a site that
// passes `{ p: undefined }` still gets the default markup.
const supplied = (components: SuppliedComponents, key: string): boolean =>
  Boolean(components[key]);

const PASSTHROUGH_TAGS = new Set([
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'p',
  'ol',
  'ul',
  'li',
]);

// The markup a mark falls back to when the site supplied no component for it. `text` is
// absent on purpose: a text component wraps the string and has no markup to stand in for.
const MARK_FALLBACK_TAG: Record<Exclude<RichTextMarkKey, 'text'>, string> = {
  bold: 'strong',
  italic: 'em',
  underline: 'u',
  strikethrough: 's',
  code: 'code',
  highlight: 'mark',
};

export function resolveRichTextNode(
  node: TinaMarkdownContent,
  components: SuppliedComponents
): RichTextInstruction {
  const fields = node as RichTextNodeFields;
  const { children, ...props } = fields;
  const content: RichTextChildren = { kind: 'content', content: children };
  const noChildren: RichTextChildren = { kind: 'none' };

  // The one decision this file makes, in the one place it is made: call the component the
  // site supplied under `key`, or build `fallback` instead. The v3 renderer dropped the
  // node's own props on the fallback path, and a site that never supplied a component has
  // never seen them on the element, so the fallback carries only what it names.
  const componentOr = (
    key: string,
    fallback: { tag: string; props?: RichTextProps },
    children: RichTextChildren
  ): RichTextInstruction =>
    supplied(components, key)
      ? { kind: 'component', key, props, children }
      : {
          kind: 'element',
          tag: fallback.tag,
          props: fallback.props ?? {},
          children,
        };

  if (PASSTHROUGH_TAGS.has(fields.type)) {
    return componentOr(fields.type, { tag: fields.type }, content);
  }

  switch (fields.type) {
    case 'lic': // List Item Content
      return componentOr('lic', { tag: 'div' }, content);

    case 'blockquote':
      // Support both blockquote and block_quote (deprecated) for backwards compatibility.
      // Naming the deprecated key second means it also carries the case where the site
      // supplied neither, which falls back to the element.
      return componentOr(
        supplied(components, 'blockquote') ? 'blockquote' : 'block_quote',
        { tag: 'blockquote' },
        content
      );

    case 'img':
      return componentOr(
        'img',
        {
          tag: 'img',
          props: { src: sanitizeUrl(fields.url), alt: fields.alt },
        },
        noChildren
      );

    case 'a':
      return componentOr(
        'a',
        { tag: 'a', props: { href: sanitizeUrl(fields.url) } },
        content
      );

    case 'code_block': {
      const value = readCodeBlockValue(fields);
      if (supplied(components, 'code_block')) {
        return {
          kind: 'component',
          key: 'code_block',
          props: { ...props, value },
          children: noChildren,
        };
      }
      return {
        kind: 'element',
        tag: 'pre',
        props: {},
        children: {
          kind: 'nodes',
          nodes: [
            {
              kind: 'element',
              tag: 'code',
              props: {},
              children: { kind: 'text', text: value },
            },
          ],
        },
      };
    }

    case 'hr':
      return componentOr('hr', { tag: 'hr' }, noChildren);

    case 'break':
      return componentOr('break', { tag: 'br' }, noChildren);

    case 'text':
      return resolveLeaf(fields, components);

    case 'mdxJsxTextElement':
    case 'mdxJsxFlowElement': {
      const name = fields.name ?? '';
      if (supplied(components, name)) {
        return {
          kind: 'component',
          key: name,
          props: fields.props ?? {},
          children: noChildren,
        };
      }
      if (name === 'table') {
        return resolveMdxTable(fields);
      }
      if (supplied(components, 'component_missing')) {
        return {
          kind: 'component',
          key: 'component_missing',
          props: { name },
          children: noChildren,
        };
      }
      return {
        kind: 'element',
        tag: 'span',
        props: {},
        children: { kind: 'text', text: `No component provided for ${name}` },
      };
    }

    case 'table':
      return resolveGfmTable(fields);

    case 'maybe_mdx':
      // We don't want to render this as it's only displayed while editing an mdx node and
      // should be transformed before form submission
      return { kind: 'nothing' };

    case 'html':
    case 'html_inline':
      if (supplied(components, fields.type)) {
        return {
          kind: 'component',
          key: fields.type,
          props,
          children: noChildren,
        };
      }
      // Escaped, not injected: v3 returned the string from the component and React
      // rendered it as text. A site that wants the markup live supplies an `html`
      // component and takes that decision itself.
      return { kind: 'text', text: fields.value ?? '' };

    case 'invalid_markdown':
      return {
        kind: 'element',
        tag: 'pre',
        props: {},
        children: { kind: 'text', text: fields.value ?? '' },
      };

    default:
      if (typeof fields.text === 'string') {
        return resolveLeaf(fields, components);
      }
      return { kind: 'nothing' };
  }
}

function resolveLeaf(
  fields: RichTextNodeFields,
  components: SuppliedComponents
): RichTextInstruction {
  const marks: RichTextMark[] = [];
  const mark = (
    key: Exclude<RichTextMarkKey, 'text'>,
    props: RichTextProps = {}
  ) => {
    marks.push(
      supplied(components, key)
        ? { kind: 'component', key, props }
        : { kind: 'element', tag: MARK_FALLBACK_TAG[key], props }
    );
  };

  // Pushed outermost first, in the order v3 nested them.
  if (fields.bold) mark('bold');
  if (fields.italic) mark('italic');
  if (fields.underline) mark('underline');
  if (fields.strikethrough) mark('strikethrough');
  if (fields.code) mark('code');
  if (fields.highlight) mark('highlight', { color: fields.highlightColor });
  // A text component only ever wraps the string itself, so it is always innermost.
  if (supplied(components, 'text')) {
    marks.push({ kind: 'component', key: 'text', props: {} });
  }

  return { kind: 'leaf', text: fields.text ?? '', marks };
}

function readCodeBlockValue(fields: RichTextNodeFields): string {
  // Extract code string from children if present, else fallback to value
  if (Array.isArray(fields.children)) {
    return fields.children
      .map((line) =>
        Array.isArray(line.children)
          ? line.children
              .map((token) => (token as RichTextNodeFields).text ?? '')
              .join('')
          : ''
      )
      .join('\n');
  }
  return typeof fields.value === 'string' ? fields.value : '';
}

type MdxTableRow = { tableCells?: { value: TinaMarkdownContent }[] };

const TABLE_ALIGNMENTS = new Set<string>(['left', 'right', 'center']);

// The alignment of each column, by position. This is author content, and a pipe table
// writes a null for a column it did not align, so anything that is not one of the three
// keywords becomes "no alignment" rather than being dropped — dropping it would shift
// the alignment of every column after it.
const columnAlignments = (
  align: unknown
): (RichTextTableAlign | undefined)[] =>
  Array.isArray(align)
    ? align.map((value) =>
        typeof value === 'string' && TABLE_ALIGNMENTS.has(value)
          ? (value as RichTextTableAlign)
          : undefined
      )
    : [];

function resolveMdxTable(fields: RichTextNodeFields): RichTextInstruction {
  const firstRowHeader = Boolean(fields.props?.firstRowHeader);
  const tableRows: MdxTableRow[] = fields.props?.tableRows ?? [];
  const cellsOf = (row: MdxTableRow | undefined): RichTextTableCell[] =>
    (row?.tableCells ?? []).map((cell) => ({ content: cell.value }));

  return {
    kind: 'table',
    source: 'mdx',
    align: columnAlignments(fields.props?.align),
    header: firstRowHeader ? cellsOf(tableRows.at(0)) : null,
    rows: (firstRowHeader ? tableRows.slice(1) : tableRows).map(cellsOf),
  };
}

function resolveGfmTable(fields: RichTextNodeFields): RichTextInstruction {
  return {
    kind: 'table',
    source: 'gfm',
    align: columnAlignments(fields.props?.align),
    // A pipe table carries its header in the markup, not in a flag, and v3 rendered every
    // row into the body. Keep that until the parser says which row is the header.
    header: null,
    rows: (fields.children ?? []).map((row) =>
      (row.children ?? []).map((cell) => ({ content: cell.children }))
    ),
  };
}
