import { BaseBlockquotePlugin } from '@udecode/plate-block-quote';
import { useEditorSelector, useEditorState } from '@udecode/plate/react';
import React from 'react';
import { helpers } from '../../plugins/core/common';
import { Icons } from './icons';
import { ToolbarButton } from './toolbar';

export const QuoteToolbarButton = ({ disabled }: { disabled?: boolean }) => {
  const editor = useEditorState();
  const pressed = useEditorSelector(
    (current) => helpers.isNodeActive(current, BaseBlockquotePlugin),
    []
  );
  return (
    <ToolbarButton
      tooltip='Quote'
      shortcut='⌘⇧.'
      pressed={pressed}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => editor.tf.toggleBlock(BaseBlockquotePlugin.key)}
    >
      <Icons.quote aria-hidden />
    </ToolbarButton>
  );
};
