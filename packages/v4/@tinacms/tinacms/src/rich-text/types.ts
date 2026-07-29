// The vocabulary of a rich-text value, and of the components a site may supply to render
// one. Nothing here names a framework. `Rendered` is whatever a binding produces, so the
// React adapter fixes it to React.JSX.Element and a future adapter fixes it to its own.

export type TinaMarkdownContent = {
  type: string;
  // Optional, because a leaf node has no children. A text node is
  // `{ type: 'text', text: '…' }`. The parser emits that shape, and the renderer
  // branches on it. A required field here would describe a tree that never exists,
  // and every caller would cast around it.
  children?: TinaMarkdownContent[];
};

// The fields the resolver reads off a node beyond `type` and `children`. They are all
// optional because the union of node shapes has never been written down; keeping the
// reads in one named type is what lets the resolver drop the `@ts-ignore` per branch that
// the v3 renderer carried.
export type RichTextNodeFields = TinaMarkdownContent & {
  text?: string;
  value?: string;
  url?: string;
  alt?: string;
  caption?: string;
  lang?: string;
  name?: string;
  props?: Record<string, any>;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  highlight?: boolean;
  highlightColor?: string;
};

export type RichTextTableAlign = 'left' | 'right' | 'center';

export type BaseComponents<Rendered> = {
  h1?: { children: Rendered };
  h2?: { children: Rendered };
  h3?: { children: Rendered };
  h4?: { children: Rendered };
  h5?: { children: Rendered };
  h6?: { children: Rendered };
  p?: { children: Rendered };
  a?: { url: string; children: Rendered };
  italic?: { children: Rendered };
  bold?: { children: Rendered };
  strikethrough?: { children: Rendered };
  underline?: { children: Rendered };
  code?: { children: Rendered };
  highlight?: { children: Rendered; color?: string };
  text?: { children: string };
  ul?: { children: Rendered };
  ol?: { children: Rendered };
  li?: { children: Rendered };
  lic?: { children: Rendered };
  blockquote?: { children: Rendered };
  code_block?: { lang?: string; value: string };
  mermaid?: { value: string };
  img?: { url: string; caption?: string; alt?: string };
  hr?: {};
  break?: {};
  maybe_mdx?: { children: Rendered };
  html?: { value: string };
  html_inline?: { value: string };
  // A cell carries the alignment of its own column, which is absent for a column the
  // table did not align.
  th?: { align?: RichTextTableAlign; children: Rendered };
  td?: { align?: RichTextTableAlign; children: Rendered };
  tr?: { children: Rendered };
  /**
   * A table arrives in one of two shapes, because the two syntaxes carry different
   * things. A table written as an MDX element hands over its own props, as every MDX
   * embed does. A pipe table has no props, so it arrives already rendered into rows,
   * like every other element. A site that supports both branches on `tableRows`.
   */
  table?:
  | {
    align?: RichTextTableAlign[];
    tableRows: { tableCells: { value: TinaMarkdownContent }[] }[];
  }
  | { children: Rendered };
  // Provide a fallback when a JSX component wasn't provided
  component_missing?: { name: string };
};

export type BaseComponentSignature<Rendered> = {
  [BK in keyof BaseComponents<Rendered>]: (
    props: BaseComponents<Rendered>[BK]
  ) => Rendered;
};

/**
 * The components a site supplies, generic over what a binding renders. A binding
 * re-exports this with `Rendered` pinned to its own element type — see the `Components`
 * alias in `adapters/react`.
 */
export type RichTextComponents<ComponentAndProps extends object, Rendered> = {
  [K in keyof ComponentAndProps]: (props: ComponentAndProps[K]) => Rendered;
} & BaseComponentSignature<Rendered>;

// The resolver only ever asks whether a key was supplied, never what it renders, so it
// takes the map at its loosest useful type. A binding keeps the precise one.
export type SuppliedComponents = Record<string, unknown>;

// The props a binding spreads onto whatever it builds.
export type RichTextProps = Record<string, unknown>;

export type RichTextMarkKey =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikethrough'
  | 'code'
  | 'highlight'
  | 'text';

/**
 * One mark on a text leaf, in the same two shapes a node resolves to: the component the
 * site supplied, or the element to fall back to. Marks arrive outermost first, and that
 * order is the contract — v3 nested bold outside italic outside underline, and a site's
 * CSS may lean on it.
 */
export type RichTextMark =
  | { kind: 'element'; tag: string; props: RichTextProps }
  | { kind: 'component'; key: RichTextMarkKey; props: RichTextProps };

export type RichTextTableCell = {
  // Left unresolved: the binding renders it back through the renderer with `p` swapped
  // for the cell element, because a cell in the mdx tree wraps its text in a paragraph.
  content: TinaMarkdownContent | TinaMarkdownContent[] | undefined;
};

/**
 * What to render for one node, said without naming a framework. Children stay
 * unresolved — a `content` child is a slice of the tree the binding feeds back through
 * its own renderer — so a binding keeps whatever memoisation it needs at the node
 * boundary instead of paying for a full walk on every render.
 */
export type RichTextChildren =
  | { kind: 'none' }
  | { kind: 'text'; text: string }
  | { kind: 'content'; content: TinaMarkdownContent[] | undefined }
  | { kind: 'nodes'; nodes: RichTextInstruction[] };

export type RichTextInstruction =
  | { kind: 'nothing' }
  | { kind: 'text'; text: string }
  | { kind: 'leaf'; text: string; marks: RichTextMark[] }
  | {
    kind: 'element';
    tag: string;
    props: RichTextProps;
    children: RichTextChildren;
  }
  | {
    kind: 'component';
    key: string;
    props: RichTextProps;
    children: RichTextChildren;
  }
  | {
    kind: 'table';
    // `mdx` is a table written as an MDX JSX element, `gfm` one written with pipes.
    // They differ only in the markup a binding falls back to, so both arrive here
    // already normalised into rows of cells.
    source: 'mdx' | 'gfm';
    // One entry per column, in column order. An entry is absent for a column that
    // carries no alignment: a pipe table writes a null for those, and the alignment
    // of every column after it would shift if they were dropped.
    align: (RichTextTableAlign | undefined)[];
    header: RichTextTableCell[] | null;
    rows: RichTextTableCell[][];
  };
