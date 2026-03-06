import React from 'react';
import { withRef } from '@udecode/cn';
import { Icons } from './icons';
import { ToolbarButton } from './toolbar';
import { useEditorContext } from '../../editor-context';
import {
  captureEvent,
  RichTextEditorSwitchedEvent,
} from '../../../../../../../../src/lib/posthog';

const useRawMarkdownToolbarButton = () => {
  const { setRawMode } = useEditorContext();

  const onMouseDown = (e) => {
    setRawMode(true);
  };

  return {
    props: {
      onMouseDown,
      pressed: false,
    },
  };
};

export const RawMarkdownToolbarButton = withRef<
  typeof ToolbarButton,
  {
    clear?: string | string[];
  }
>(({ clear, ...rest }, ref) => {
  const { props } = useRawMarkdownToolbarButton();
  return (
    <ToolbarButton
      ref={ref}
      onClick={() =>
        captureEvent(RichTextEditorSwitchedEvent, { to: 'markdown' })
      }
      tooltip='Raw Markdown'
      {...rest}
      {...props}
      data-testid='markdown-button'
    >
      <Icons.raw />
    </ToolbarButton>
  );
});
