import { ElementApi } from '@udecode/plate';
import { unwrapList } from '@udecode/plate-list';
import {
  type PlateEditor,
  ParagraphPlugin,
  useEditorRef,
  useEditorSelector,
} from '@udecode/plate/react';
import React from 'react';
import { useMenuCloseFocus } from './use-menu-close-focus';
import { useToolbarContext } from '../toolbar/toolbar-provider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  useOpenState,
} from './plate-ui/dropdown-menu';
import {
  getHeadingItem,
  headingItemsByLevel,
  paragraphItem,
} from './plate-ui/heading-items';
import { ToolbarButton } from './plate-ui/toolbar';
import { useToolBlocked } from './use-tool-blocked';

const LIST_TYPES = ['ul', 'ol', 'li', 'lic'];
const MAX_UNWRAPS = 20;

const hasListInSelection = (editor: PlateEditor) =>
  editor.api.some({
    match: (node) =>
      ElementApi.isElement(node) &&
      (LIST_TYPES.includes(node.type) || 'listStyleType' in node),
  });

/** One unwrapList only lifts one list level; a selection that spans nested lists needs several. */
const unwrapListsInSelection = (editor: PlateEditor) => {
  for (let pass = 0; pass < MAX_UNWRAPS && hasListInSelection(editor); pass++) {
    unwrapList(editor);
  }
};

const headingTextClass: Record<string, string> = {
  h1: 'text-2xl font-semibold',
  h2: 'text-xl font-semibold',
  h3: 'text-lg font-semibold',
  h4: 'text-base font-semibold',
  h5: 'text-sm font-semibold',
  h6: 'text-sm font-medium',
};

function useCurrentBlockType(): string {
  return useEditorSelector((editor) => {
    const nodes = Array.from(
      editor.api.nodes({
        match: (n) => editor.api.isBlock(n),
        mode: 'highest',
      })
    );
    if (nodes.length === 0) return ParagraphPlugin.key;
    const first = (nodes[0][0].type as string) || ParagraphPlugin.key;
    const same = nodes.every(
      ([node]) => ((node.type as string) || ParagraphPlugin.key) === first
    );
    return same ? first : ParagraphPlugin.key;
  }, []);
}

export function TextStyleMenu({
  showLabel = true,
  disabled = false,
}: {
  showLabel?: boolean;
  disabled?: boolean;
}) {
  const { headingLevels } = useToolbarContext();
  const editor = useEditorRef();
  const openState = useOpenState();
  const closeFocus = useMenuCloseFocus();
  const { isBlocked } = useToolBlocked();
  const value = useCurrentBlockType();
  const items = [
    paragraphItem,
    ...headingLevels.map((level) => headingItemsByLevel[level]),
  ];
  const selected = getHeadingItem(value) ?? paragraphItem;
  const { icon: SelectedIcon, label } = selected;

  return (
    <DropdownMenu modal={false} {...openState}>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <ToolbarButton
          open={openState.open}
          showArrow
          disabled={disabled}
          tooltip='Text style'
          aria-label={`Text style: ${label}`}
        >
          <SelectedIcon className='size-4' aria-hidden />
          {showLabel ? <span>{label}</span> : null}
        </ToolbarButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='start'
        aria-label='Text style'
        {...closeFocus}
      >
        <DropdownMenuRadioGroup
          value={value}
          onValueChange={(type) => {
            unwrapListsInSelection(editor);
            editor.tf.toggleBlock(type);
            editor.tf.collapse();
            editor.tf.focus();
          }}
        >
          {items.map(({ icon: Icon, label: itemLabel, value: itemValue }) => (
            <DropdownMenuRadioItem
              key={itemValue}
              value={itemValue}
              disabled={isBlocked(itemValue)}
              className={headingTextClass[itemValue]}
            >
              <Icon className='size-4 text-muted-foreground' aria-hidden />
              {itemLabel}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
