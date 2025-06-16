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

export const KEY_BLOCKQUOTE_ENTER_LOGGER = 'blockquote-enter-logger';

export const createBlockquoteEnterLoggerPlugin =
  createPlatePlugin({
    key: KEY_BLOCKQUOTE_ENTER_LOGGER,

    handlers: {
      onKeyDown: ({editor, event}) => {
        if (event.key !== 'Enter') return;

        const blockquoteEntry = editor.api.above({
          match: { type: BlockquotePlugin.key },
        });
  
        if (!blockquoteEntry) return;

        // const [blockquoteNode, blockquotePath] = blockquoteEntry;
      
        // // Prevent default behavior
        // event.preventDefault();
        
        // // CORRECTED: Create the insertion path properly
        // const insertionPath = [
        //   ...blockquotePath, 
        //   blockquoteNode.children.length
        // ];
        
        // // Insert new paragraph INSIDE the blockquote
        // editor.tf.insertNode(
        //   {
        //     type: 'p',
        //     children: [{ text: '' }],
        //   },
        //   { 
        //     at: insertionPath,
        //     select: true,  // Focus the new paragraph
        //     mode: 'lowest' // Ensures proper insertion
        //   }
        // );
  
        // const [blockquoteNode, blockquotePath] = blockquoteEntry;
        // const currentLength = blockquoteNode.children.length;
  
        // editor.tf.insertNodes(
        //   [
        //     {
        //       type: 'p',
        //       children: [{ text: 'N' }],
        //     },
        //     {
        //       type: ELEMENT_BREAK,
        //       children: [{ text: '' }],
        //     }
        //   ],
        //   {
        //     at: [...blockquotePath, currentLength], // Insert at end
        //     select: true // Focus the last inserted node
        //   }
        // );
        event.preventDefault();

      const [blockquoteNode, blockquotePath] = blockquoteEntry;
      
      // Exactly what works for 'N', but with just the break
      editor.tf.insertNodes(
        [{
          type: ELEMENT_BREAK,
          children: [{ text: '' }]
        }],
        {
          at: [...blockquotePath, blockquoteNode.children.length],
          select: true
        }
      );
        
        console.log('[DEBUG] Editor value AFTER:', JSON.stringify(editor.children, null, 2));

      },
    },
  }
);

export const ELEMENT_BREAK = 'break';

export const createBreakPlugin =
  createPlatePlugin({
    key: ELEMENT_BREAK,
    node: {
      isElement: true,
      isVoid: true,
      isInline: true,
      component: (props) => (
        <div {...props.attributes}>
          <br />
        </div>
      ),
    },
  });


  
