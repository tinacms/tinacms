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

type Style = Record<string, string | undefined>;

type CellTag = 'th' | 'td';

export interface RichTextHost<Rendered> {
  element(
    tag: string,
    props: Record<string, unknown>,
    children: Rendered | null
  ): Rendered;
  component(
    component: unknown,
    props: Record<string, unknown>,
    children: Rendered | null
  ): Rendered;
  text(value: string): Rendered;
  list(items: Rendered[]): Rendered;
  memo?(render: () => Rendered, cacheKey: unknown): Rendered;
}

type RenderContext<Rendered> = {
  host: RichTextHost<Rendered>;
  components: SuppliedComponents;
  paragraphAs?: (children: Rendered | null) => Rendered;
};

export function renderRichText<Rendered>(
  content: TinaMarkdownContent | TinaMarkdownContent[] | undefined,
  components: SuppliedComponents,
  host: RichTextHost<Rendered>
): Rendered {
  return renderNodes(nodesOf(content), { host, components });
}

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

const markStyle = (props: RichTextProps): RichTextProps =>
  props.color ? { style: { backgroundColor: props.color } } : {};

const TABLE_BORDER = '1px solid #EDECF3';
const TABLE_CELL_PADDING = '0.25rem';

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

export function styleToCss(style: Style | undefined): string | undefined {
  if (!style) return undefined;
  const declarations = Object.entries(style)
    .filter(([, value]) => value !== undefined)
    .map(([property, value]) => `${toKebabCase(property)}: ${value}`);
  return declarations.length ? `${declarations.join('; ')};` : undefined;
}

const toKebabCase = (property: string) =>
  property.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
