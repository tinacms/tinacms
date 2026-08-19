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

// Plate's SoftBreakPlugin puts a literal "\n" in the text. Markdown re-flows
// that into a space, and the line break is lost. A `break` element serializes
// to a `\` hard break, which makes the round trip.
//
// Code blocks and table cells stay with SoftBreakPlugin. Code blocks need a
// real newline. A GFM table cell cannot hold a hard break.
const NO_HARD_BREAK = [
  CodeBlockPlugin.key,
  TableCellPlugin.key,
  TableCellHeaderPlugin.key,
];

export const createSoftBreakPlugin = createPlatePlugin({
  key: KEY_SOFT_BREAK,

  handlers: {
    onKeyDown: ({ editor, event }) => {
      // mod+enter and mod+shift+enter belong to ExitBreakPlugin.
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
