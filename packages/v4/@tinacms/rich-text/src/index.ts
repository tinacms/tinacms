// `@tinacms/rich-text` — the value contract.
//
// Deliberately free of the editor and its ~40 packages: a host that only needs to
// describe or transform rich-text content (a codec, a renderer, a schema) imports
// this entry and pays nothing for Plate. The editor itself is `./editor`.
export {
  EMPTY_RICH_TEXT,
  type RichTextNode,
  type RichTextValue,
} from './value';
export {
  buildErrorMessage,
  INVALID_MARKDOWN_TYPE,
  type InvalidMarkdownElement,
} from './error-message';
