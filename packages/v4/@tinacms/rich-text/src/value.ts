export interface RichTextNode {
  type: string;
  [key: string]: unknown;
}

export interface RichTextValue {
  type: 'root';
  children: RichTextNode[];
}

export const EMPTY_RICH_TEXT: RichTextValue = Object.freeze({
  type: 'root',
  children: Object.freeze([]) as RichTextNode[],
});
