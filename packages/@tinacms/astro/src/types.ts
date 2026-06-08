/**
 * Plate AST node types Tina returns from rich-text fields. Mirrors the shape
 * documented in `packages/@tinacms/mdx/src/parse/plate.ts` — kept inline so
 * the Astro renderer can stay framework-free and not pull @tinacms/mdx into
 * the page bundle.
 */

/**
 * Astro doesn't publicly export `AstroComponentFactory`, so we use a
 * structural placeholder. The consumer's Astro pipeline performs the real
 * compile-time check that whatever they pass is a valid component.
 */
export type AstroComponent = (...args: never[]) => unknown;

export type TinaRichTextRoot = {
  type: 'root';
  children: TinaRichTextNode[];
};

export type TinaRichTextNode =
  | BlockElement
  | InlineElement
  | TextElement
  | MdxElement;

export type LinkElement = {
  type: 'a';
  url: string;
  title?: string;
  children: InlineElement[];
};

export type ImageElement = {
  type: 'img';
  url: string;
  alt?: string;
  caption?: string;
};

export type CodeBlockElement = {
  type: 'code_block';
  lang?: string;
  value?: string;
  children?: { children: TextElement[] }[];
};

/** Per-column horizontal alignment for table cells. */
export type TableAlign = 'left' | 'right' | 'center';

/** A paragraph — the block wrapper Tina puts around inline content. */
export type ParagraphElement = {
  type: 'p';
  children: InlineElement[];
};

/** A single table cell. Its content is wrapped in a paragraph by the parser. */
export type TableCellElement = {
  type: 'td';
  children: ParagraphElement[];
};

export type TableRowElement = {
  type: 'tr';
  children: TableCellElement[];
};

/**
 * Native markdown table node (the shape `@tinacms/mdx` emits from a GFM
 * table). Rows/cells are plain `tr`/`td`; per-column text-align lives on
 * `props.align`. Mirrors `TableElement` in
 * `packages/@tinacms/mdx/src/parse/plate.ts`.
 */
export type TableElement = {
  type: 'table';
  props?: { align?: TableAlign[] };
  children: TableRowElement[];
};

/** A cell in the legacy MDX-flow table; its `value` is itself rich text. */
export type MdxTableCell = { value: TinaRichTextContent };

export type MdxTableRow = { tableCells: MdxTableCell[] };

/**
 * Props of the legacy MDX-flow table — an `mdxJsxFlowElement` named `table`
 * whose cells live on `props.tableRows` rather than as `tr`/`td` child nodes.
 * Older editors produced this shape; `MdxTableNode.astro` still renders it.
 */
export type MdxTableProps = {
  align?: TableAlign[];
  /** When true, the first row is rendered as a `<thead>` of `<th>`. */
  firstRowHeader?: boolean;
  tableRows?: MdxTableRow[];
};

export type BlockElement =
  | ParagraphElement
  | {
      type: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
      children: InlineElement[];
    }
  | { type: 'blockquote'; children: TinaRichTextNode[] }
  | { type: 'ul' | 'ol'; children: TinaRichTextNode[] }
  | { type: 'li'; children: TinaRichTextNode[] }
  | { type: 'lic'; children: InlineElement[] }
  | { type: 'hr' }
  | { type: 'break' }
  | ImageElement
  | CodeBlockElement
  | TableElement
  | { type: 'maybe_mdx' }
  | { type: 'html'; value: string }
  | { type: 'invalid_markdown'; value: string };

export type InlineElement =
  | TextElement
  | LinkElement
  | { type: 'html_inline'; value: string }
  | MdxElement;

export type TextElement = {
  type: 'text';
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  highlight?: boolean;
  highlightColor?: string;
};

export type MdxElement = {
  type: 'mdxJsxFlowElement' | 'mdxJsxTextElement';
  name: string;
  props: Record<string, unknown>;
  children?: TinaRichTextNode[];
};

export type TinaRichTextContent =
  | TinaRichTextRoot
  | TinaRichTextNode[]
  | null
  | undefined;

/** A map of mdxJsx name (or default tag override) → Astro component. */
export type CustomComponentsMap = Record<string, AstroComponent>;
