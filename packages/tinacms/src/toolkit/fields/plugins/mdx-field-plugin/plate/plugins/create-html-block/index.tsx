import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import { CodeBlockPlugin } from '@udecode/plate-code-block/react';
import {
  TableCellHeaderPlugin,
  TableCellPlugin,
} from '@udecode/plate-table/react';
import { createPlatePlugin } from '@udecode/plate/react';
import React from 'react';

export const createHTMLBlockPlugin = createPlatePlugin({
  key: 'html',
  node: {
    isElement: true,
    isVoid: true,
    isInline: false,
  },
});

export const createHTMLInlinePlugin = createPlatePlugin({
  key: 'html_inline',
  node: {
    isElement: true,
    isVoid: true,
    isInline: true,
  },
});

export const KEY_SOFT_BREAK = 'tina-soft-break';

// Plate's SoftBreakPlugin inserts a literal "\n", which markdown re-flows into a
// space when serialized, so the line break is silently lost. Our parser and
// serializer round-trip a `break` element (a `\` hard break) instead, so insert
// that for shift+Enter, and for a plain Enter inside a blockquote where a new
// paragraph would end the quote.
//
// Code blocks and table cells are left to SoftBreakPlugin: code blocks want a
// real newline, and GFM table cells cannot hold a hard break at all.
const NO_HARD_BREAK = [
  CodeBlockPlugin.key,
  TableCellPlugin.key,
  TableCellHeaderPlugin.key,
];

export const createSoftBreakPlugin = createPlatePlugin({
  key: KEY_SOFT_BREAK,

  handlers: {
    onKeyDown: ({ editor, event }) => {
      // mod+enter / mod+shift+enter belong to ExitBreakPlugin.
      if (event.key !== 'Enter' || event.metaKey || event.ctrlKey) return;

      const inBlockquote = editor.api.above({
        match: { type: BlockquotePlugin.key },
      });
      if (!event.shiftKey && !inBlockquote) return;

      if (editor.api.some({ match: { type: NO_HARD_BREAK } })) return;

      if (editor.api.isExpanded()) editor.tf.delete();

      const cursorPosition = editor.selection?.focus;
      if (!cursorPosition) return;

      event.preventDefault();

      editor.tf.insertNodes(
        [
          { type: ELEMENT_BREAK, children: [{ text: '' }] },
          { type: 'text', text: '' },
        ],
        {
          at: { path: cursorPosition.path, offset: cursorPosition.offset },
          select: true,
        }
      );
    },
  },
});

export const ELEMENT_BREAK = 'break';

// Custom Plate plugin to handle Enter key inside blockquotes. We dont need those slate attributes as we just need a br to render in the editor. If we adding those attributes, it will break the editor. children from plate it will cause weird behavior in firefox browser
export const createBreakPlugin = createPlatePlugin({
  key: ELEMENT_BREAK,
  node: {
    isElement: true,
    isVoid: true,
    isInline: true,
    component: () => {
      return <br />;
    },
  },
});
