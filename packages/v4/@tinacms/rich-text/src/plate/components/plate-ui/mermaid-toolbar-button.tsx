import { TElement } from '@udecode/plate';
import { CodeBlockPlugin } from '@udecode/plate-code-block/react';
import type { PlateEditor } from '@udecode/plate/react';
import React from 'react';
import type { CodeLineElement } from '../../types';

const DEFAULT_MERMAID_CONFIG = `%% This won't render without implementing a rendering engine (e.g. mermaid on npm)
flowchart TD
    id1(this is an example flow diagram)
    --> id2(modify me to see changes!)
    id2
    --> id3(Click the top button to preview the changes)
    --> id4(Learn about mermaid diagrams - mermaid.js.org)`;

function makeCodeLine(text: string): CodeLineElement {
  return {
    type: 'code_line',
    children: [{ text }],
  };
}

export const insertMermaid = (editor: PlateEditor) => {
  const node: TElement = {
    type: CodeBlockPlugin.key,
    lang: 'mermaid',
    children: DEFAULT_MERMAID_CONFIG.split('\n').map(makeCodeLine),
    value: DEFAULT_MERMAID_CONFIG,
  };
  editor.tf.insertNodes(node, { nextBlock: true, select: true });
};
