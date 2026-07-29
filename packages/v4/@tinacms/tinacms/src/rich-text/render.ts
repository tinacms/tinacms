// The whole render, driven through one interface a framework implements.
//
// resolve.ts answers what a single node renders as. This file does everything built on
// top of that answer: the recursion, the fallback markup for a node the site supplied no
// component for, the nesting of marks on a leaf, and the shape of a table. All of it is
// framework-free, so a new node type, a new fallback or a fix to a table lands once and
// every framework has it.
//
// What is left for a framework is RichTextHost: four ways to build a value, and an
// optional memo hook. The React binding in adapters/react is the reference; it is about
// thirty lines.

import { resolveRichTextNode } from './resolve';
import type {
  RichTextChildren,
  RichTextInstruction,
  RichTextProps,
  RichTextTableAlign,
  RichTextTableCell,
  SuppliedComponents,
  TinaMarkdownContent,
} from './types';

// A style object, in the camelCase convention every framework already reads. A host that
// writes markup as text runs it through styleToCss below.
type Style = Record<string, string | undefined>;

// The two elements a table cell can be. A header cell only exists on a table that told us
// its first row is one.
type CellTag = 'th' | 'td';

/**
 * What a framework has to supply to render rich text. `Rendered` is whatever that
 * framework calls a renderable value — a React element, an HTML string, a vnode.
 *
 * Nothing here is about markdown. A host that can build an element, call a component,
 * make a text value and join a list can render every rich-text document there is.
 */
export interface RichTextHost<Rendered> {
  /** Build an element of the framework. `children` is null when the node takes none. */
  element(
    tag: string,
    props: Record<string, unknown>,
    children: Rendered | null
  ): Rendered;
  /** Call a component the site supplied. `component` is the value out of its map. */
  component(
    component: unknown,
    props: Record<string, unknown>,
    children: Rendered | null
  ): Rendered;
  /** A text value. Framework escaping applies: rich text never injects markup. */
  text(value: string): Rendered;
  /** Join siblings. The host assigns whatever keys or separators it needs. */
  list(items: Rendered[]): Rendered;
  /**
   * Optional. Wrap the render of one node so the host can cache it against `cacheKey`,
   * which is stable for as long as the node and its components are. React uses this to
   * keep as-you-type editing responsive; a host that renders once should leave it out.
   */
  memo?(render: () => Rendered, cacheKey: unknown): Rendered;
}

type RenderContext<Rendered> = {
  host: RichTextHost<Rendered>;
  components: SuppliedComponents;
  // Set while rendering a table cell. A cell wraps its content in a paragraph, so the
  // paragraph is what becomes the th or td.
  paragraphAs?: (children: Rendered | null) => Rendered;
};

/**
 * Render a rich-text value with the given components, through the given host.
 */
export function renderRichText<Rendered>(
  content: TinaMarkdownContent | TinaMarkdownContent[] | undefined,
  components: SuppliedComponents,
  host: RichTextHost<Rendered>
): Rendered {
  return renderNodes(nodesOf(content), { host, components });
}

// A value is either the list of nodes itself or a node whose children are that list.
const nodesOf = (
  content: TinaMarkdownContent | TinaMarkdownContent[] | undefined
): TinaMarkdownContent[] => {
  if (!content) return [];
  return Array.isArray(content) ? content : (content.children ?? []);
};

function renderNodes<Rendered>(
  nodes: TinaMarkdownContent[],
  context: RenderContext<Rendered>
): Rendered {
  const { host } = context;
  return host.list(
    nodes.map((node) => {
      const render = () =>
        renderInstruction(
          resolveRichTextNode(node, context.components),
          context
        );
      return host.memo
        ? host.memo(render, [context.components, node])
        : render();
    })
  );
}

function renderInstruction<Rendered>(
  instruction: RichTextInstruction,
  context: RenderContext<Rendered>
): Rendered {
  const { host, components } = context;
  switch (instruction.kind) {
    case 'nothing':
      return host.list([]);
    case 'text':
      return host.text(instruction.text);
    case 'leaf':
      return renderLeaf(instruction, context);
    case 'element': {
      const children = renderChildren(instruction.children, context);
      if (context.paragraphAs && instruction.tag === 'p') {
        return context.paragraphAs(children);
      }
      return host.element(instruction.tag, instruction.props, children);
    }
    case 'component':
      return host.component(
        components[instruction.key],
        instruction.props,
        renderChildren(instruction.children, context)
      );
    case 'table':
      return renderTable(instruction, context);
  }
}

function renderChildren<Rendered>(
  children: RichTextChildren,
  context: RenderContext<Rendered>
): Rendered | null {
  switch (children.kind) {
    case 'none':
      return null;
    case 'text':
      return context.host.text(children.text);
    case 'content':
      return renderNodes(children.content ?? [], context);
    case 'nodes':
      return context.host.list(
        children.nodes.map((node) => renderInstruction(node, context))
      );
  }
}

function renderLeaf<Rendered>(
  instruction: Extract<RichTextInstruction, { kind: 'leaf' }>,
  context: RenderContext<Rendered>
): Rendered {
  const { host, components } = context;
  // The marks arrive outermost first, so fold from the end to put the string at the
  // centre and the first mark on the outside.
  let rendered = host.text(instruction.text);
  for (let index = instruction.marks.length - 1; index >= 0; index--) {
    const mark = instruction.marks[index];
    rendered =
      mark.kind === 'component'
        ? host.component(components[mark.key], mark.props, rendered)
        : host.element(mark.tag, markStyle(mark.props), rendered);
  }
  return rendered;
}

// A highlight is the one mark whose fallback markup carries its own colour, and `mark`
// has no attribute for it.
const markStyle = (props: RichTextProps): RichTextProps =>
  props.color ? { style: { backgroundColor: props.color } } : {};

const TABLE_BORDER = '1px solid #EDECF3';
const TABLE_CELL_PADDING = '0.25rem';

// The fallback look of a table, which is the one place the renderer has an opinion about
// appearance. A pipe table gets the borders v3 drew on it; a table written as an MDX
// element is left bare. Either is replaced wholesale by supplying table/tr/th/td.
const TABLE_FALLBACK = {
  mdx: {
    table: undefined as Style | undefined,
    cell: (align?: RichTextTableAlign): Style => ({ textAlign: align }),
  },
  gfm: {
    table: { border: TABLE_BORDER } as Style,
    cell: (align?: RichTextTableAlign): Style => ({
      textAlign: align,
      border: TABLE_BORDER,
      padding: TABLE_CELL_PADDING,
    }),
  },
};

function renderTable<Rendered>(
  instruction: Extract<RichTextInstruction, { kind: 'table' }>,
  context: RenderContext<Rendered>
): Rendered {
  const { host, components } = context;
  const { align, header, rows, source } = instruction;
  const fallback = TABLE_FALLBACK[source];

  const cellRenderer =
    (tag: CellTag, index: number) => (children: Rendered | null) => {
      const props = { align: align[index] };
      return components[tag]
        ? host.component(components[tag], props, children)
        : host.element(
            tag,
            { ...props, style: fallback.cell(align[index]) },
            children
          );
    };

  const row = (cells: RichTextTableCell[], tag: CellTag): Rendered => {
    const rendered = host.list(
      cells.map((tableCell, index) =>
        // A cell renders with no components but its own: v3 scoped the map down to the
        // paragraph swap while rendering one, and a site's components do not reach inside
        // a table today.
        renderNodes(nodesOf(tableCell.content), {
          host,
          components: {},
          paragraphAs: cellRenderer(tag, index),
        })
      )
    );
    return components.tr
      ? host.component(components.tr, {}, rendered)
      : host.element('tr', {}, rendered);
  };

  const body = host.element(
    'tbody',
    {},
    host.list(rows.map((cells) => row(cells, 'td')))
  );
  const inner = host.list(
    header ? [host.element('thead', {}, row(header, 'th')), body] : [body]
  );

  return components.table
    ? host.component(components.table, {}, inner)
    : host.element('table', { style: fallback.table }, inner);
}

/**
 * Serialise a style object from the fallback markup into a CSS declaration string, for a
 * host that writes markup as text rather than handing objects to a framework.
 */
export function styleToCss(style: Style | undefined): string | undefined {
  if (!style) return undefined;
  const declarations = Object.entries(style)
    .filter(([, value]) => value !== undefined)
    .map(([property, value]) => `${toKebabCase(property)}: ${value}`);
  return declarations.length ? `${declarations.join('; ')};` : undefined;
}

const toKebabCase = (property: string) =>
  property.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
