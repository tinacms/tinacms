'use client';

import React from 'react';
import { withRef } from '@udecode/cn';
import { Icons } from './icons';
import { ToolbarButton } from './toolbar';
import {
  useEditorRef,
  useMarkToolbarButton,
  useMarkToolbarButtonState,
} from '@udecode/plate/react';
import {
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
} from '@udecode/plate-basic-marks/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  useOpenState,
} from './dropdown-menu';

const MarkToolbarButton = withRef<
  typeof ToolbarButton,
  {
    clear?: string | string[];
    nodeType: string;
  }
>(({ clear, nodeType, ...rest }, ref) => {
  const state = useMarkToolbarButtonState({ clear, nodeType });
  const { props } = useMarkToolbarButton(state);

  return <ToolbarButton ref={ref} {...props} {...rest} />;
});

const highlightColors = [
  { label: 'Yellow', value: '#FEF08A' },
  { label: 'Green', value: '#BBF7D0' },
  { label: 'Blue', value: '#BFDBFE' },
  { label: 'Red', value: '#CC4141' },
] as const;

export const BoldToolbarButton = () => (
  <MarkToolbarButton tooltip='Bold (⌘+B)' nodeType={BoldPlugin.key}>
    <Icons.bold />
  </MarkToolbarButton>
);

export const StrikethroughToolbarButton = () => (
  <MarkToolbarButton tooltip='Strikethrough' nodeType={StrikethroughPlugin.key}>
    <Icons.strikethrough />
  </MarkToolbarButton>
);

export const ItalicToolbarButton = () => (
  <MarkToolbarButton tooltip='Italic (⌘+I)' nodeType={ItalicPlugin.key}>
    <Icons.italic />
  </MarkToolbarButton>
);

export const CodeToolbarButton = () => (
  <MarkToolbarButton tooltip='Code (⌘+E)' nodeType={CodePlugin.key}>
    <Icons.code />
  </MarkToolbarButton>
);

export const HighlightToolbarButton = () => <HighlightColorToolbarButton />;

const useHighlightToolbar = () => {
  const editor = useEditorRef();
  const openState = useOpenState();
  const savedSelection = React.useRef(editor.selection);
  const inlineCodeActive = useMarkToolbarButtonState({
    nodeType: CodePlugin.key,
  }).pressed;

  const rememberSelection = React.useCallback(() => {
    if (editor.selection) {
      savedSelection.current = structuredClone(editor.selection);
    }
  }, [editor]);

  React.useEffect(() => {
    if (openState.open) {
      rememberSelection();
    }
  }, [openState.open, rememberSelection]);

  const applyHighlight = React.useCallback(
    (highlightColor?: string) => {
      if (inlineCodeActive) {
        openState.onOpenChange(false);
        return;
      }

      if (savedSelection.current) {
        editor.tf.select(structuredClone(savedSelection.current));
      }

      if (highlightColor) {
        editor.tf.addMark('highlight', true);
        editor.tf.addMark('highlightColor', highlightColor);
      } else {
        editor.tf.removeMark('highlight');
        editor.tf.removeMark('highlightColor');
      }

      editor.tf.setNodes(
        highlightColor
          ? {
              highlight: true,
              highlightColor,
            }
          : {
              highlight: undefined,
              highlightColor: undefined,
            },
        {
          at: editor.selection ?? undefined,
          match: (node) => editor.api.isText(node),
          split: true,
        }
      );

      editor.tf.focus();
      openState.onOpenChange(false);
    },
    [editor, inlineCodeActive, openState]
  );

  return {
    applyHighlight,
    inlineCodeActive,
    openState,
    rememberSelection,
  };
};

const HighlightColorToolbarButton = () => {
  const { applyHighlight, inlineCodeActive, openState, rememberSelection } =
    useHighlightToolbar();

  return (
    <DropdownMenu modal={false} {...openState}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton
          isDropdown
          showArrow
          pressed={openState.open}
          tooltip='Highlight color'
          disabled={inlineCodeActive}
          onMouseDown={rememberSelection}
        >
          <div className='flex items-center gap-1.5'>
            <Icons.highlight />
            <span className='sr-only'>Highlight color</span>
          </div>
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent align='start' className='min-w-[180px]'>
        <DropdownMenuItem onSelect={() => applyHighlight()}>
          Clear highlight
        </DropdownMenuItem>
        {highlightColors.map((color) => (
          <DropdownMenuItem
            key={color.value}
            onSelect={() => applyHighlight(color.value)}
          >
            <span
              className='mr-2 inline-block size-4 rounded border border-gray-300'
              style={{ backgroundColor: color.value }}
            />
            {color.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
