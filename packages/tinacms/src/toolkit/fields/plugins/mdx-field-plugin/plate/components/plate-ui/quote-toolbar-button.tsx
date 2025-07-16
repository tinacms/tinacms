import React from 'react';

import { withRef } from '@udecode/cn';

import { Icons } from './icons';

import { ToolbarButton } from './toolbar';
import { useEditorState } from '@udecode/plate/react';
import { BaseBlockquotePlugin } from '@udecode/plate-block-quote';
import { helpers } from '../../plugins/core/common';

const useBlockQuoteToolbarButtonState = () => {
  const editor = useEditorState();

  const isBlockActive = () =>
    helpers.isNodeActive(editor, BaseBlockquotePlugin.key);

  return {
    pressed: isBlockActive(),
  };
};

const useBlockQuoteToolbarButton = (state) => {
  const editor = useEditorState();

  const onClick = () => {
    editor.tf.toggleBlock(BaseBlockquotePlugin.key);
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

export const QuoteToolbarButton = withRef<
  typeof ToolbarButton,
  {
    clear?: string | string[];
  }
>(({ clear, ...rest }, ref) => {
  const state = useBlockQuoteToolbarButtonState();
  const { props } = useBlockQuoteToolbarButton(state);

  return (
    <ToolbarButton ref={ref} tooltip='Quote (⌘+⇧+.)' {...rest} {...props}>
      <Icons.quote />
    </ToolbarButton>
  );
});
