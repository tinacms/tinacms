import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
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

export const KEY_BLOCKQUOTE_ENTER_BREAK = 'blockquote-enter-break';

export const createBlockquoteEnterBreakPlugin = createPlatePlugin({
  key: KEY_BLOCKQUOTE_ENTER_BREAK,

  handlers: {
    onKeyDown: ({ editor, event }) => {
      if (event.key !== 'Enter') return;
      const blockquoteEntry = editor.api.above({
        match: { type: BlockquotePlugin.key },
      });

      if (!blockquoteEntry) return;

      event.preventDefault();
      const cursorPosition = editor.selection?.focus;
      if (!cursorPosition) return;

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
