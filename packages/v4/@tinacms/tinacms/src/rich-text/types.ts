// The vocabulary of a rich-text value, framework-free. `Rendered` is whatever a
// binding produces.

export type TinaMarkdownContent = {
  type: string;
  children?: TinaMarkdownContent[];
};

// All optional because the union of node shapes has never been written down;
// this named type is what lets the resolver drop v3's per-branch `@ts-ignore`.
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
  th?: { align?: RichTextTableAlign; children: Rendered };
  td?: { align?: RichTextTableAlign; children: Rendered };
  tr?: { children: Rendered };
  // Two shapes: an MDX table hands over its own props, a pipe table arrives
  // already rendered. A site that supports both branches on `tableRows`.
  table?:
  | {
    align?: RichTextTableAlign[];
    tableRows: { tableCells: { value: TinaMarkdownContent }[] }[];
  }
  | { children: Rendered };
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

// The resolver only asks whether a key was supplied; a binding keeps the
// precise type.
export type SuppliedComponents = Record<string, unknown>;

export type RichTextProps = Record<string, unknown>;

export type RichTextMarkKey =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikethrough'
  | 'code'
  | 'highlight'
  | 'text';

// Marks arrive outermost first, and that order is the contract: v3 nested bold
// outside italic outside underline, and a site's CSS may lean on it.
export type RichTextMark =
  | { kind: 'element'; tag: string; props: RichTextProps }
  | { kind: 'component'; key: RichTextMarkKey; props: RichTextProps };

export type RichTextTableCell = {
  // Unresolved: the binding renders it back through the renderer with `p`
  // swapped for the cell element.
  content: TinaMarkdownContent | TinaMarkdownContent[] | undefined;
};

// Children stay unresolved so a binding keeps its memoisation at the node
// boundary instead of paying for a full walk on every render.
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
    // Differ only in fallback markup; both arrive normalised into rows.
    source: 'mdx' | 'gfm';
    // Per column; absent entries kept so later columns do not shift.
    align: (RichTextTableAlign | undefined)[];
    header: RichTextTableCell[] | null;
    rows: RichTextTableCell[][];
  };
