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

// Custom Plate plugin to handle Enter key inside blockquotes.
// Our parsing logic expects a soft break with type 'break' to be inserted for proper handling within blockquotes.
// This plugin inserts a 'break' element and a new paragraph when Enter is pressed inside a blockquote.
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
      // Log the entire editor value BEFORE insertion
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
