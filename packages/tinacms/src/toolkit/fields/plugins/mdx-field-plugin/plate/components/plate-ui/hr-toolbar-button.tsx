import React from 'react';

import { withRef } from '@udecode/cn';
import { useEditorState } from '@udecode/plate/react';

import { Icons } from './icons';
import { ToolbarButton } from './toolbar';
import { helpers } from '../../plugins/core/common';
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react';
import { ParagraphPlugin } from '@udecode/plate/react';

const useHorizontalRuleToolbarButtonState = () => {
  const editor = useEditorState();

  const isBlockActive = () =>
    helpers.isNodeActive(editor, HorizontalRulePlugin.key);

  return {
    pressed: isBlockActive(),
  };
};

const useHorizontalRuleToolbarButton = (state) => {
  const editor = useEditorState();

  const onClick = () => {
    editor.tf.insertNodes({
      type: ParagraphPlugin.key,
      children: [{ text: '' }],
    });
    editor.tf.setNodes({ type: HorizontalRulePlugin.key });
    editor.tf.insertNodes({
      type: ParagraphPlugin.key,
      children: [{ text: '' }],
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

export const HorizontalRuleToolbarButton = withRef<
  typeof ToolbarButton,
  {
    clear?: string | string[];
  }
>(({ clear, ...rest }, ref) => {
  const state = useHorizontalRuleToolbarButtonState();

  const { props } = useHorizontalRuleToolbarButton(state);

  return (
    <ToolbarButton ref={ref} tooltip='Horizontal Rule' {...rest} {...props}>
      <Icons.horizontalRule />
    </ToolbarButton>
  );
});
