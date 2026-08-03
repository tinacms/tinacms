import { CodeLineElement } from '@tinacms/mdx';
import { withRef } from '@udecode/cn';
import { TElement } from '@udecode/plate';
import { CodeBlockPlugin } from '@udecode/plate-code-block/react';
import { useEditorState } from '@udecode/plate/react';
import React from 'react';
import { helpers } from '../../plugins/core/common';
import { Icons } from './icons';
import { ToolbarButton } from './toolbar';

const DEFAULT_MERMAID_CONFIG = `%% This won't render without implementing a rendering engine (e.g. mermaid on npm)
flowchart TD
    id1(this is an example flow diagram)
    --> id2(modify me to see changes!)
    id2
    --> id3(Click the top button to preview the changes)
    --> id4(Learn about mermaid diagrams - mermaid.js.org)`;

const useMermaidToolbarButtonState = () => {
  const editor = useEditorState();

  const isBlockActive = () => helpers.isNodeActive(editor, CodeBlockPlugin.key);

  return {
    pressed: isBlockActive(),
  };
};

function makeCodeLine(text: string): CodeLineElement {
  return {
    type: 'code_line',
    children: [{ text }],
  };
}

const useMermaidToolbarButton = (state) => {
  const editor = useEditorState();

  const onClick = () => {
    const newMermaidCodeBlockNode: TElement = {
      type: CodeBlockPlugin.key,
      lang: 'mermaid',
      children: DEFAULT_MERMAID_CONFIG.split('\n').map(makeCodeLine),
      value: DEFAULT_MERMAID_CONFIG,
    };

    editor.tf.insertNodes(newMermaidCodeBlockNode, {
      nextBlock: true,
      select: true,
    });
  };

  const onMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return {
    props: {
      onClick,
      onMouseDown,
      pressed: state.pressed,
    },
  };
};

export const MermaidToolbarButton = withRef<
  typeof ToolbarButton,
  {
    clear?: string | string[];
  }
>(({ clear, ...rest }, ref) => {
  const state = useMermaidToolbarButtonState();

  const { props } = useMermaidToolbarButton(state);

  return (
    <ToolbarButton ref={ref} tooltip='Mermaid' {...rest} {...props}>
      <Icons.mermaid />
    </ToolbarButton>
  );
});
