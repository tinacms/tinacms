export type TinaMarkdownContent = {
  type: string;
  children?: TinaMarkdownContent[];
};

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

export type RichTextComponents<ComponentAndProps extends object, Rendered> = {
  [K in keyof ComponentAndProps]: (props: ComponentAndProps[K]) => Rendered;
} & BaseComponentSignature<Rendered>;

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

export type RichTextMark =
  | { kind: 'element'; tag: string; props: RichTextProps }
  | { kind: 'component'; key: RichTextMarkKey; props: RichTextProps };

export type RichTextTableCell = {
  content: TinaMarkdownContent | TinaMarkdownContent[] | undefined;
};

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
      source: 'mdx' | 'gfm';
      align: (RichTextTableAlign | undefined)[];
      header: RichTextTableCell[] | null;
      rows: RichTextTableCell[][];
    };
