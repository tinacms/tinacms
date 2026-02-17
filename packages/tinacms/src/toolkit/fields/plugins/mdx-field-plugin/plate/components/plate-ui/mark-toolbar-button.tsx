'use client';

import React from 'react';
import { withRef } from '@udecode/cn';
import { Icons } from './icons';
import { ToolbarButton } from './toolbar';
import {
  useMarkToolbarButton,
  useMarkToolbarButtonState,
  useEditorRef,
  useEditorSelector,
} from 'platejs/react';
import {
  BaseBoldPlugin,
  BaseCodePlugin,
  BaseHighlightPlugin,
  BaseItalicPlugin,
  BaseStrikethroughPlugin,
} from '@platejs/basic-nodes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
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

export const BoldToolbarButton = () => (
  <MarkToolbarButton tooltip='Bold (⌘+B)' nodeType={BaseBoldPlugin.key}>
    <Icons.bold />
  </MarkToolbarButton>
);

export const StrikethroughToolbarButton = () => (
  <MarkToolbarButton tooltip='Strikethrough' nodeType={BaseStrikethroughPlugin.key}>
    <Icons.strikethrough />
  </MarkToolbarButton>
);

export const ItalicToolbarButton = () => (
  <MarkToolbarButton tooltip='Italic (⌘+I)' nodeType={BaseItalicPlugin.key}>
    <Icons.italic />
  </MarkToolbarButton>
);

export const CodeToolbarButton = () => (
  <MarkToolbarButton tooltip='Code (⌘+E)' nodeType={BaseCodePlugin.key}>
    <Icons.code />
  </MarkToolbarButton>
);

// Highlight colors configuration
export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink' | 'orange';

const highlightColors: { label: string; value: HighlightColor; bgClass: string }[] = [
  { label: 'Yellow', value: 'yellow', bgClass: 'bg-yellow-200' },
  { label: 'Green', value: 'green', bgClass: 'bg-green-200' },
  { label: 'Blue', value: 'blue', bgClass: 'bg-blue-200' },
  { label: 'Pink', value: 'pink', bgClass: 'bg-pink-200' },
  { label: 'Orange', value: 'orange', bgClass: 'bg-orange-200' },
];

// Color swatch component
const ColorSwatch = ({ color, className = '' }: { color: string; className?: string }) => (
  <span className={`inline-block w-4 h-4 rounded ${color} ${className}`} />
);

export const HighlightToolbarButton = () => {
  const editor = useEditorRef();
  const openState = useOpenState();

  // Check if highlight is currently active
  const isHighlightActive = useEditorSelector((editor) => {
    const marks = editor.api.marks();
    return marks?.[BaseHighlightPlugin.key] === true;
  }, []);

  // Get current highlight color from selection
  const currentColor = useEditorSelector((editor): HighlightColor => {
    const marks = editor.api.marks();
    return (marks?.highlightColor as HighlightColor) || 'yellow';
  }, []);

  const handleColorSelect = (color: HighlightColor) => {
    // If highlight is already active with this color, remove it
    if (isHighlightActive && currentColor === color) {
      editor.tf.removeMark(BaseHighlightPlugin.key);
      editor.tf.removeMark('highlightColor');
    } else {
      // Apply highlight with selected color
      editor.tf.addMark(BaseHighlightPlugin.key, true);
      editor.tf.addMark('highlightColor', color);
    }
    editor.tf.focus();
  };

  const currentColorConfig = highlightColors.find((c) => c.value === currentColor) || highlightColors[0];

  return (
    <DropdownMenu modal={false} {...openState}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton
          showArrow
          isDropdown
          pressed={isHighlightActive}
          tooltip='Highlight'
        >
          <Icons.highlight />
          <ColorSwatch color={currentColorConfig.bgClass} className="ml-0.5" />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align='start'
        className='min-w-0 rounded-none rounded-bl rounded-br border-border'
      >
        <DropdownMenuRadioGroup
          className='flex flex-col gap-0.5'
          onValueChange={(value) => handleColorSelect(value as HighlightColor)}
          value={isHighlightActive ? currentColor : ''}
        >
          {highlightColors.map(({ label, value, bgClass }) => (
            <DropdownMenuRadioItem
              className='min-w-[120px]'
              key={value}
              value={value}
            >
              <ColorSwatch color={bgClass} className="mr-2" />
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
