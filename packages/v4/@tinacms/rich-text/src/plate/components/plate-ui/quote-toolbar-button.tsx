import { BaseBlockquotePlugin } from '@udecode/plate-block-quote';
import { useEditorState } from '@udecode/plate/react';
import React from 'react';
import { helpers } from '../../plugins/core/common';
import { Icons } from './icons';
import { ToolbarButton } from './toolbar';

export const QuoteToolbarButton = ({ disabled }: { disabled?: boolean }) => {
  const editor = useEditorState();
  return (
    <ToolbarButton
      tooltip='Quote'
      shortcut='⌘⇧.'
      pressed={helpers.isNodeActive(editor, BaseBlockquotePlugin.key)}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => editor.tf.toggleBlock(BaseBlockquotePlugin.key)}
    >
      <Icons.quote aria-hidden />
    </ToolbarButton>
  );
};
