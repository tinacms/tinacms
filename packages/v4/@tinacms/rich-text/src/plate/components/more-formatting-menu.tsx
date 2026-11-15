import { Type } from 'lucide-react';
import { useEditorRef } from '@udecode/plate/react';
import type { TRange } from '@udecode/plate';
import React from 'react';
import type { MoreFormattingTool } from '../toolbar/toolbar-layout';
import { ToolbarButton } from './plate-ui/toolbar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  useOpenState,
} from './plate-ui/dropdown-menu';
import {
  CodeMenuItem,
  ColorSubMenus,
  StrikethroughMenuItem,
} from './plate-ui/mark-toolbar-button';

/** The More formatting trigger: Strikethrough, Code, Highlight color and Text color, limited to `tools`. */
export function MoreFormattingMenu({
  tools,
  disabled = false,
}: {
  tools: readonly MoreFormattingTool[];
  disabled?: boolean;
}) {
  const editor = useEditorRef();
  const openState = useOpenState();
  const savedSelection = React.useRef<TRange | null>(null);

  return (
    <DropdownMenu
      modal={false}
      open={openState.open}
      onOpenChange={(open) => {
        if (open && editor.selection) {
          savedSelection.current = structuredClone(editor.selection);
        }
        openState.onOpenChange(open);
      }}
    >
      <DropdownMenuTrigger asChild disabled={disabled}>
        <ToolbarButton
          open={openState.open}
          showArrow
          disabled={disabled}
          tooltip='More formatting'
        >
          <Type aria-hidden />
        </ToolbarButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='start'
        aria-label='More formatting'
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          editor.tf.focus();
        }}
      >
        {tools.includes('strikethrough') ? <StrikethroughMenuItem /> : null}
        {tools.includes('code') ? <CodeMenuItem /> : null}
        <ColorSubMenus
          showHighlight={tools.includes('highlight')}
          showTextColor={tools.includes('textColor')}
          savedSelection={savedSelection}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
