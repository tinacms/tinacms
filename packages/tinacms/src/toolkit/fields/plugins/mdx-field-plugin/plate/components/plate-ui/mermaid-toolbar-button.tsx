import { withRef } from '@udecode/cn';
import { type PlateEditor, useEditorState } from '@udecode/plate/react';
import React from 'react';
import { helpers } from '../../plugins/core/common';
import { ELEMENT_MERMAID } from '../../plugins/custom/mermaid-plugin';
import { Icons } from './icons';
import { ToolbarButton } from './toolbar';
import { getPluginType, TElement } from '@udecode/plate';

export const insertEmptyMermaid = (editor: PlateEditor) => {
  const matchCodeElements = (node: TElement) =>
    node.type === getPluginType(editor, ELEMENT_MERMAID);

  if (
    editor.api.some({
      match: matchCodeElements,
    })
  ) {
    return;
  }

  const node = {
    type: ELEMENT_MERMAID,
    value: '',
    children: [{ type: 'text', text: '' }],
  };

  if (editor.api.isAt({ start: true })) {
    editor.tf.setNodes(node);
  } else {
    editor.tf.insertNode(node);
  }
};

const useMermaidToolbarButtonState = () => {
  const editor = useEditorState();

  const isBlockActive = () => helpers.isNodeActive(editor, ELEMENT_MERMAID);

  return {
    pressed: isBlockActive(),
  };
};

const useMermaidToolbarButton = (state) => {
  const editor = useEditorState();

  const onClick = () => {
    editor.tf.insertNodes(editor.api.create.block({ type: 'mermaid' }), {
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
