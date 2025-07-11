import React from 'react';

import { withRef } from '@udecode/cn';
import { useEditorState } from '@udecode/plate/react';

import { Icons } from './icons';
import { ToolbarButton } from './toolbar';
import { helpers } from '../../plugins/core/common';
// import { insertEmptyCodeBlock } from '../../transforms/insert-empty-block';
import { CodeBlockPlugin } from '@udecode/plate-code-block/react';
import { insertEmptyCodeBlock } from '@udecode/plate-code-block';

const useCodeBlockToolbarButtonState = () => {
  const editor = useEditorState();

  const isBlockActive = () => helpers.isNodeActive(editor, CodeBlockPlugin.key);

  return {
    pressed: isBlockActive(),
  };
};

const useCodeBlockToolbarButton = (state) => {
  const editor = useEditorState();

  const onClick = () => {
    insertEmptyCodeBlock(editor);
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

export const CodeBlockToolbarButton = withRef<
  typeof ToolbarButton,
  {
    clear?: string | string[];
  }
>(({ clear, ...rest }, ref) => {
  const state = useCodeBlockToolbarButtonState();

  const { props } = useCodeBlockToolbarButton(state);

  return (
    <ToolbarButton ref={ref} tooltip='Code Block' {...rest} {...props}>
      <Icons.codeBlock />
    </ToolbarButton>
  );
});
