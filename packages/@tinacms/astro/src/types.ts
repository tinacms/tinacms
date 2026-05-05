/**
 * Plate AST node types Tina returns from rich-text fields. Mirrors the shape
 * documented in `packages/@tinacms/mdx/src/parse/plate.ts` — kept inline so
 * the Astro renderer can stay framework-free and not pull @tinacms/mdx into
 * the page bundle.
 */

/**
 * Astro doesn't publicly export the `AstroComponentFactory` type, so we use
 * a structural placeholder. The consumer's Astro pipeline performs the real
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

export type BlockElement =
  | { type: 'p'; children: InlineElement[] }
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
  | { type: 'img'; url: string; alt?: string; caption?: string }
  | {
      type: 'code_block';
      lang?: string;
      value?: string;
      children?: { children: TextElement[] }[];
    }
  | { type: 'maybe_mdx' }
  | { type: 'html'; value: string }
  | { type: 'invalid_markdown'; value: string };

export type InlineElement =
  | TextElement
  | { type: 'a'; url: string; title?: string; children: InlineElement[] }
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
