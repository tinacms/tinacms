import React, { useEffect, type ComponentType, type SVGProps } from 'react';

import { withRef } from '@udecode/cn';
import { type PlateEditor, PlateElement } from '@udecode/plate/react';
import { HEADING_KEYS } from '@udecode/plate-heading';
import { Icons } from './icons';
import {
  SlashCommandOpenedEvent,
  SlashCommandUsedEvent,
} from '../../../../../../../lib/posthog/posthog';
import { captureEvent } from '../../../../../../../lib/posthog/posthogProvider';

import {
  InlineCombobox,
  InlineComboboxContent,
  InlineComboboxEmpty,
  InlineComboboxInput,
  InlineComboboxItem,
} from './inline-combobox';
import {
  BulletedListPlugin,
  NumberedListPlugin,
} from '@udecode/plate-list/react';
import { toggleList } from '@udecode/plate-list';
import { useToolbarContext } from '../../toolbar/toolbar-provider';
import type { HeadingLevel } from '../../toolbar/toolbar-overrides';

interface SlashCommandRule {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  onSelect: (editor: PlateEditor) => void;
  value: string;
  keywords?: string[];
}

const headingRulesByLevel: Record<HeadingLevel, SlashCommandRule> = {
  h1: {
    icon: Icons.h1,
    onSelect: (editor) => editor.tf.toggleBlock(HEADING_KEYS.h1),
    value: 'Heading 1',
  },
  h2: {
    icon: Icons.h2,
    onSelect: (editor) => editor.tf.toggleBlock(HEADING_KEYS.h2),
    value: 'Heading 2',
  },
  h3: {
    icon: Icons.h3,
    onSelect: (editor) => editor.tf.toggleBlock(HEADING_KEYS.h3),
    value: 'Heading 3',
  },
  h4: {
    icon: Icons.h4,
    onSelect: (editor) => editor.tf.toggleBlock(HEADING_KEYS.h4),
    value: 'Heading 4',
  },
  h5: {
    icon: Icons.h5,
    onSelect: (editor) => editor.tf.toggleBlock(HEADING_KEYS.h5),
    value: 'Heading 5',
  },
  h6: {
    icon: Icons.h6,
    onSelect: (editor) => editor.tf.toggleBlock(HEADING_KEYS.h6),
    value: 'Heading 6',
  },
};

// The slash menu historically only exposed h1-h3; preserve that default so
// existing editors don't suddenly grow new entries.
const DEFAULT_SLASH_HEADING_LEVELS: readonly HeadingLevel[] = [
  'h1',
  'h2',
  'h3',
];

const listRules: SlashCommandRule[] = [
  {
    icon: Icons.ul,
    keywords: ['ul', 'unordered list'],
    onSelect: (editor) => {
      toggleList(editor, { type: BulletedListPlugin.key });
    },
    value: 'Bulleted list',
  },
  {
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
    const rules: SlashCommandRule[] = [
      ...slashHeadingLevels.map((level) => headingRulesByLevel[level]),
      ...listRules,
    ];

    useEffect(() => {
      captureEvent(SlashCommandOpenedEvent);
    }, []);

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

            {rules.map(({ icon: Icon, keywords, onSelect, value }) => (
              <InlineComboboxItem
                key={value}
                keywords={keywords}
                onClick={() => {
                  onSelect(editor);
                  captureEvent(SlashCommandUsedEvent, {
                    command: value,
                  });
                }}
                value={value}
              >
                <Icon aria-hidden className='mr-2 size-4' />
                {value}
              </InlineComboboxItem>
            ))}
          </InlineComboboxContent>
        </InlineCombobox>

        {children}
      </PlateElement>
    );
  }
);
