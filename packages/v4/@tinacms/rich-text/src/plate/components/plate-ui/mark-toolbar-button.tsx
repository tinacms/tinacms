'use client';

import {
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
} from '@udecode/plate-basic-marks/react';
import {
  useEditorRef,
  useMarkToolbarButton,
  useMarkToolbarButtonState,
} from '@udecode/plate/react';
import type { TRange } from '@udecode/plate';
import React from 'react';
import type { RichTextColorOption } from '../../toolbar/toolbar-overrides';
import { useToolbarContext } from '../../toolbar/toolbar-provider';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@tinacms/ui/components/tooltip';
import { KbdShortcut } from '@tinacms/ui/components/kbd';
import { cn } from '@tinacms/ui/lib/utils';
import {
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from './dropdown-menu';
import { Icons } from './icons';
import { MenuIcon } from './menu-icon';
import { ToolbarButton } from './toolbar';

type MarkButtonProps = {
  nodeType: string;
  tooltip: string;
  shortcut: string;
  disabled?: boolean;
  children: React.ReactNode;
};

const MarkToolbarButton = ({
  nodeType,
  tooltip,
  shortcut,
  disabled,
  children,
}: MarkButtonProps) => {
  const state = useMarkToolbarButtonState({ nodeType });
  const { props } = useMarkToolbarButton(state);
  return (
    <ToolbarButton
      {...props}
      tooltip={tooltip}
      shortcut={shortcut}
      disabled={disabled}
    >
      {children}
    </ToolbarButton>
  );
};

export const BoldToolbarButton = ({ disabled }: { disabled?: boolean }) => (
  <MarkToolbarButton
    tooltip='Bold'
    shortcut='⌘B'
    nodeType={BoldPlugin.key}
    disabled={disabled}
  >
    <Icons.bold />
  </MarkToolbarButton>
);

export const ItalicToolbarButton = ({ disabled }: { disabled?: boolean }) => (
  <MarkToolbarButton
    tooltip='Italic'
    shortcut='⌘I'
    nodeType={ItalicPlugin.key}
    disabled={disabled}
  >
    <Icons.italic />
  </MarkToolbarButton>
);

const MarkMenuItem = ({
  nodeType,
  label,
  shortcut,
  icon,
  disabled,
}: {
  nodeType: string;
  label: string;
  shortcut: string;
  icon: React.ReactNode;
  disabled?: boolean;
}) => {
  const state = useMarkToolbarButtonState({ nodeType });
  const { props } = useMarkToolbarButton(state);
  return (
    <DropdownMenuCheckboxItem
      checked={state.pressed}
      disabled={disabled}
      onSelect={() => props.onClick()}
    >
      {icon}
      <span className='flex-1'>{label}</span>
      <KbdShortcut keys={shortcut} size='sm' />
    </DropdownMenuCheckboxItem>
  );
};

export const StrikethroughMenuItem = ({ disabled }: { disabled?: boolean }) => (
  <MarkMenuItem
    nodeType={StrikethroughPlugin.key}
    label='Strikethrough'
    shortcut='⌘⇧X'
    icon={
      <MenuIcon>
        <Icons.strikethrough />
      </MenuIcon>
    }
    disabled={disabled}
  />
);

export const CodeMenuItem = ({ disabled }: { disabled?: boolean }) => (
  <MarkMenuItem
    nodeType={CodePlugin.key}
    label='Code'
    shortcut='⌘E'
    icon={
      <MenuIcon>
        <Icons.code />
      </MenuIcon>
    }
    disabled={disabled}
  />
);

type ColorMarks = Record<string, string | boolean | undefined>;

const toHighlightMarks = (color?: string): ColorMarks =>
  color
    ? { highlight: true, highlightColor: color }
    : { highlight: undefined, highlightColor: undefined };

const toTextColorMarks = (color?: string): ColorMarks => ({
  textColor: color,
});

export const highlightColors = [
  { label: 'Yellow', value: '#FEF08A' },
  { label: 'Green', value: '#BBF7D0' },
  { label: 'Blue', value: '#BFDBFE' },
  { label: 'Red', value: '#CC4141' },
] as const;

const useColorMarks = (
  toMarks: (color?: string) => ColorMarks,
  savedSelection: React.RefObject<TRange | null>
) => {
  const editor = useEditorRef();
  return React.useCallback(
    (color?: string) => {
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
    },
    [editor, savedSelection, toMarks]
  );
};

const Swatch = ({
  color,
  current,
  onPick,
}: {
  color: RichTextColorOption;
  current: boolean;
  onPick: () => void;
}) => (
  <Tooltip>
    <TooltipTrigger
      render={
        <DropdownMenuItem
          aria-label={color.label}
          onSelect={onPick}
          className={cn(
            'size-6 min-h-0 w-6 justify-center rounded-full border border-border p-0',
            current && 'ring-2 ring-ring ring-offset-1'
          )}
          style={{ backgroundColor: color.value }}
        />
      }
    />
    <TooltipContent>{color.label}</TooltipContent>
  </Tooltip>
);

const SwatchSub = ({
  label,
  clearLabel,
  icon,
  colors,
  currentValue,
  toMarks,
  savedSelection,
  disabled,
}: {
  label: string;
  clearLabel: string;
  icon: React.ReactNode;
  colors: readonly RichTextColorOption[];
  currentValue: string | undefined;
  toMarks: (color?: string) => ColorMarks;
  savedSelection: React.RefObject<TRange | null>;
  disabled?: boolean;
}) => {
  const apply = useColorMarks(toMarks, savedSelection);
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger disabled={disabled}>
        {icon}
        {label}
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent aria-label={label} className='min-w-0 w-auto'>
        <div className='grid grid-cols-4 gap-2 p-2'>
          {colors.map((color) => (
            <Swatch
              key={color.value}
              color={color}
              current={currentValue === color.value}
              onPick={() => apply(color.value)}
            />
          ))}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => apply()}>
          {clearLabel}
        </DropdownMenuItem>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
};

export const ColorSubMenus = ({
  showHighlight,
  showTextColor,
  disabled,
  savedSelection,
}: {
  showHighlight: boolean;
  showTextColor: boolean;
  disabled?: boolean;
  savedSelection: React.RefObject<TRange | null>;
}) => {
  const { textColors } = useToolbarContext();
  const editor = useEditorRef();
  const inlineCodeActive = useMarkToolbarButtonState({
    nodeType: CodePlugin.key,
  }).pressed;
  const marks = editor.api.marks() as
    | { highlightColor?: string; textColor?: string }
    | null
    | undefined;
  const off = disabled || inlineCodeActive;
  return (
    <>
      {showHighlight ? (
        <SwatchSub
          label='Highlight color'
          clearLabel='Clear highlight'
          icon={
            <MenuIcon>
              <Icons.highlight />
            </MenuIcon>
          }
          colors={highlightColors}
          currentValue={marks?.highlightColor}
          toMarks={toHighlightMarks}
          savedSelection={savedSelection}
          disabled={off}
        />
      ) : null}
      {showTextColor ? (
        <SwatchSub
          label='Text color'
          clearLabel='Clear text color'
          icon={
            <MenuIcon>
              <Icons.textColor />
            </MenuIcon>
          }
          colors={textColors}
          currentValue={marks?.textColor}
          toMarks={toTextColorMarks}
          savedSelection={savedSelection}
          disabled={off}
        />
      ) : null}
    </>
  );
};
