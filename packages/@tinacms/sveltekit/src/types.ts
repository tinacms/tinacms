import type { Component, Snippet } from 'svelte';

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

export type TableAlign = 'left' | 'right' | 'center';

export type TableCellElement = {
  type: 'td';
  children: { type: 'p'; children: InlineElement[] }[];
};

export type TableRowElement = {
  type: 'tr';
  children: TableCellElement[];
};

export type TableElement = {
  type: 'table';
  props?: { align?: TableAlign[] };
  children: TableRowElement[];
};

export type MdxTableProps = {
  align?: TableAlign[];
  firstRowHeader?: boolean;
  tableRows?: { tableCells: { value: TinaRichTextContent }[] }[];
};

export type BlockElement =
  | { type: 'p'; children: InlineElement[] }
  | { type: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'; children: InlineElement[] }
  | { type: 'blockquote' | 'ul' | 'ol' | 'li'; children: TinaRichTextNode[] }
  | { type: 'lic'; children: InlineElement[] }
  | { type: 'hr' | 'break' | 'maybe_mdx' }
  | ImageElement
  | CodeBlockElement
  | TableElement
  | { type: 'html' | 'html_inline' | 'invalid_markdown'; value: string };

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
  textColor?: string;
};

export type MdxElement = {
  type: 'mdxJsxFlowElement' | 'mdxJsxTextElement';
  name: string;
  props?: Record<string, unknown>;
  children?: TinaRichTextNode[];
};

export type TinaRichTextContent =
  | TinaRichTextRoot
  | TinaRichTextNode[]
  | null
  | undefined;

export type GeneratedRichTextContent = {
  type: string;
  children?: unknown[];
  [key: string]: unknown;
};

export type TinaComponent = Component<any>;

type ComponentWithChildren = Component<{ children?: Snippet }>;

export interface LinkComponentProps {
  url: string;
  children?: Snippet;
}

export interface ImageComponentProps {
  url: string;
  alt?: string;
  caption?: string;
}

export interface CodeBlockComponentProps {
  value: string;
  lang?: string;
}

export interface HtmlComponentProps {
  value: string;
}

export interface TableComponentProps {
  node: TableElement;
  children?: Snippet;
}

export interface TableCellComponentProps {
  align?: TableAlign;
  children?: Snippet;
}

/** Svelte components keyed by Tina node type or custom template name. */
export type CustomComponentsMap<
  Custom extends Record<string, object> = Record<never, never>,
> = {
  p?: ComponentWithChildren;
  h1?: ComponentWithChildren;
  h2?: ComponentWithChildren;
  h3?: ComponentWithChildren;
  h4?: ComponentWithChildren;
  h5?: ComponentWithChildren;
  h6?: ComponentWithChildren;
  ul?: ComponentWithChildren;
  ol?: ComponentWithChildren;
  li?: ComponentWithChildren;
  lic?: ComponentWithChildren;
  blockquote?: ComponentWithChildren;
  tr?: ComponentWithChildren;
  hr?: Component;
  break?: Component;
  a?: Component<LinkComponentProps>;
  img?: Component<ImageComponentProps>;
  code_block?: Component<CodeBlockComponentProps>;
  html?: Component<HtmlComponentProps>;
  html_inline?: Component<HtmlComponentProps>;
  table?: Component<TableComponentProps>;
  td?: Component<TableCellComponentProps>;
  th?: Component<TableCellComponentProps>;
} & {
  [K in keyof Custom]?: Component<Custom[K]>;
} & Record<string, TinaComponent | undefined>;

export interface TinaMarkdownProps<
  Custom extends Record<string, object> = Record<never, never>,
> {
  content:
    | TinaRichTextContent
    | GeneratedRichTextContent
    | GeneratedRichTextContent[];
  components?: CustomComponentsMap<Custom>;
}
