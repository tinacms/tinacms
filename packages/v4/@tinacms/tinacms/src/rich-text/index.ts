// The rich-text renderer, minus a framework.
//
// `renderRichText(content, components, host)` is the whole render. A framework supplies
// a RichTextHost — build an element, call a component, make text, join siblings — and
// gets every node type, fallback and table for free. Adding one is a change here, not in
// each binding. The React host is in adapters/react.
//
// `resolveRichTextNode` is the layer underneath, for a host that wants to drive the walk
// itself rather than implement the interface.
//
// Nothing in here imports React, so this entry is safe from a server, a codec, or a
// binding for any other framework.
export { type RichTextHost, renderRichText } from './render';
export { resolveRichTextNode } from './resolve';
export type {
  BaseComponents,
  BaseComponentSignature,
  RichTextChildren,
  RichTextComponents,
  RichTextInstruction,
  RichTextMark,
  RichTextMarkKey,
  RichTextNodeFields,
  RichTextTableAlign,
  RichTextTableCell,
  SuppliedComponents,
  TinaMarkdownContent,
} from './types';
