import React, { type ComponentType, type SVGProps } from 'react';

import { withRef } from '@udecode/cn';
import { TablePlugin } from '@udecode/plate-table/react';
import { HEADING_KEYS } from '@udecode/plate-heading';
import {
  type PlateEditor,
  PlateElement,
  useEditorSelector,
} from '@udecode/plate/react';
import { Icons } from './icons';

import { toggleList } from '@udecode/plate-list';
import {
  BulletedListPlugin,
  NumberedListPlugin,
} from '@udecode/plate-list/react';
import { unsupportedItemsInTable } from '../../plugins/core/common';
import type { HeadingLevel } from '../../toolbar/toolbar-overrides';
import { useToolbarContext } from '../../toolbar/toolbar-provider';
import {
  InlineCombobox,
  InlineComboboxContent,
  InlineComboboxEmpty,
  InlineComboboxInput,
  InlineComboboxItem,
} from './inline-combobox';

interface SlashCommandRule {
  hint: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  onSelect: (editor: PlateEditor) => void;
  value: string;
  keywords?: string[];
}

const headingRulesByLevel: Record<HeadingLevel, SlashCommandRule> = {
  h1: {
    hint: '#',
    icon: Icons.h1,
    onSelect: (editor) => editor.tf.toggleBlock(HEADING_KEYS.h1),
    value: 'Heading 1',
  },
  h2: {
    hint: '##',
    icon: Icons.h2,
    onSelect: (editor) => editor.tf.toggleBlock(HEADING_KEYS.h2),
    value: 'Heading 2',
  },
  h3: {
    hint: '###',
    icon: Icons.h3,
    onSelect: (editor) => editor.tf.toggleBlock(HEADING_KEYS.h3),
    value: 'Heading 3',
  },
  h4: {
    hint: '####',
    icon: Icons.h4,
    onSelect: (editor) => editor.tf.toggleBlock(HEADING_KEYS.h4),
    value: 'Heading 4',
  },
  h5: {
    hint: '#####',
    icon: Icons.h5,
    onSelect: (editor) => editor.tf.toggleBlock(HEADING_KEYS.h5),
    value: 'Heading 5',
  },
  h6: {
    hint: '######',
    icon: Icons.h6,
    onSelect: (editor) => editor.tf.toggleBlock(HEADING_KEYS.h6),
    value: 'Heading 6',
  },
};

const DEFAULT_SLASH_HEADING_LEVELS: readonly HeadingLevel[] = [
  'h1',
  'h2',
  'h3',
];

const headingBlockedInTable = (level: HeadingLevel) =>
  unsupportedItemsInTable.has(level);

const listRules: SlashCommandRule[] = [
  {
    hint: '-',
    icon: Icons.ul,
    keywords: ['ul', 'unordered list'],
    onSelect: (editor) => {
      toggleList(editor, { type: BulletedListPlugin.key });
    },
    value: 'Bulleted list',
  },
  {
    hint: '1.',
    icon: Icons.ol,
    keywords: ['ol', 'ordered list'],
    onSelect: (editor) => {
      toggleList(editor, { type: NumberedListPlugin.key });
    },
    value: 'Numbered list',
  },
];

export const SlashInputElement = withRef<typeof PlateElement>(
  ({ className, ...props }, ref) => {
    const { children, editor, element } = props;
    const { headingLevels, headingLevelsConfigured } = useToolbarContext();
    const slashHeadingLevels = headingLevelsConfigured
      ? headingLevels
      : DEFAULT_SLASH_HEADING_LEVELS;
    const inTable = useEditorSelector(
      (editor) =>
        !!editor.selection &&
        editor.api.some({ match: { type: TablePlugin.key } }),
      []
    );
    const rules: (SlashCommandRule & { disabled: boolean })[] = [
      ...slashHeadingLevels.map((level) => ({
        ...headingRulesByLevel[level],
        disabled: inTable && headingBlockedInTable(level),
      })),
      ...listRules.map((rule) => ({ ...rule, disabled: false })),
    ];

    return (
      <PlateElement
        as='span'
        data-slate-value={element.value}
        ref={ref}
        {...props}
      >
        <InlineCombobox element={element} trigger='/'>
          <InlineComboboxInput />

          <InlineComboboxContent>
            <InlineComboboxEmpty>
              No matching commands found
            </InlineComboboxEmpty>

            {rules.map(
              ({ disabled, hint, icon: Icon, keywords, onSelect, value }) => (
                <InlineComboboxItem
                  key={value}
                  disabled={disabled}
                  keywords={keywords}
                  onClick={() => onSelect(editor)}
                  value={value}
                >
                  <Icon aria-hidden className='size-4 shrink-0' />
                  <span className='min-w-0 flex-1 truncate'>{value}</span>
                  <span className='text-xs text-muted-foreground'>{hint}</span>
                </InlineComboboxItem>
              )
            )}
          </InlineComboboxContent>
        </InlineCombobox>

        {children}
      </PlateElement>
    );
  }
);
