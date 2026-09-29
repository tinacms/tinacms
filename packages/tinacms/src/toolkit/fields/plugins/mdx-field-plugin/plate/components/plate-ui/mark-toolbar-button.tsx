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
import { useToolbarContext } from '../../toolbar/toolbar-provider';
import type { RichTextColorOption } from '../../toolbar/toolbar-overrides';

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

/**
 * Leaf props a colour dropdown writes for a chosen colour. `undefined`
 * values are removed, so the same function also describes "clear".
 */
type ColorMarks = Record<string, string | boolean | undefined>;

/**
 * Shared behaviour for colour dropdowns: remembers the selection while the
 * menu is open (focus moves into the menu) and applies/clears marks on it.
 */
const useColorMarkToolbar = (toMarks: (color?: string) => ColorMarks) => {
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

  const applyColor = React.useCallback(
    (color?: string) => {
      if (inlineCodeActive) {
        openState.onOpenChange(false);
        return;
      }

      if (savedSelection.current) {
        editor.tf.select(structuredClone(savedSelection.current));
      }

      const marks = toMarks(color);
      for (const [key, value] of Object.entries(marks)) {
        if (value === undefined) {
          editor.tf.removeMark(key);
        } else {
          editor.tf.addMark(key, value);
        }
      }

      editor.tf.setNodes(marks, {
        at: editor.selection ?? undefined,
        match: (node) => editor.api.isText(node),
        split: true,
      });

      editor.tf.focus();
      openState.onOpenChange(false);
    },
    [editor, inlineCodeActive, openState, toMarks]
  );

  return {
    applyColor,
    inlineCodeActive,
    openState,
    rememberSelection,
  };
};

/** Toolbar dropdown offering "clear" plus one item per palette colour. */
const ColorDropdownToolbarButton = ({
  tooltip,
  icon,
  clearLabel,
  colors,
  toMarks,
  renderSwatch,
}: {
  tooltip: string;
  icon: React.ReactNode;
  clearLabel: string;
  colors: readonly RichTextColorOption[];
  toMarks: (color?: string) => ColorMarks;
  renderSwatch: (color: string) => React.ReactNode;
}) => {
  const { applyColor, inlineCodeActive, openState, rememberSelection } =
    useColorMarkToolbar(toMarks);

  return (
    <DropdownMenu modal={false} {...openState}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton
          isDropdown
          showArrow
          pressed={openState.open}
          tooltip={tooltip}
          disabled={inlineCodeActive}
          onMouseDown={rememberSelection}
        >
          <div className='flex items-center gap-1.5'>
            {icon}
            <span className='sr-only'>{tooltip}</span>
          </div>
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent align='start' className='min-w-[180px]'>
        <DropdownMenuItem onSelect={() => applyColor()}>
          {clearLabel}
        </DropdownMenuItem>
        {colors.map((color) => (
          <DropdownMenuItem
            key={color.value}
            onSelect={() => applyColor(color.value)}
          >
            {renderSwatch(color.value)}
            {color.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const toHighlightMarks = (color?: string): ColorMarks =>
  color
    ? { highlight: true, highlightColor: color }
    : { highlight: undefined, highlightColor: undefined };

const toTextColorMarks = (color?: string): ColorMarks => ({
  textColor: color,
});

export const HighlightToolbarButton = () => {
  const { highlightColors } = useToolbarContext();
  return (
    <ColorDropdownToolbarButton
      tooltip='Highlight color'
      icon={<Icons.highlight />}
      clearLabel='Clear highlight'
      colors={highlightColors}
      toMarks={toHighlightMarks}
      renderSwatch={(color) => (
        <span
          className='mr-2 inline-block size-4 rounded border border-gray-300'
          style={{ backgroundColor: color }}
        />
      )}
    />
  );
};

export const TextColorToolbarButton = () => {
  const { textColors } = useToolbarContext();
  return (
    <ColorDropdownToolbarButton
      tooltip='Text color'
      icon={<Icons.textColor />}
      clearLabel='Clear text color'
      colors={textColors}
      toMarks={toTextColorMarks}
      renderSwatch={(color) => (
        <span
          aria-hidden
          className='mr-2 inline-block w-4 text-center font-bold'
          style={{ color }}
        >
          A
        </span>
      )}
    />
  );
};
