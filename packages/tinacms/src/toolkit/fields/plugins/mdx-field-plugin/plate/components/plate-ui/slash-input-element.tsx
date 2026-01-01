import React, { ComponentType, SVGProps, useMemo } from 'react';
import { withRef } from '@udecode/cn';
import {
  PlateElement,
  useEditorRef,
  type PlateEditor,
} from '@udecode/plate/react';
import { HEADING_KEYS } from '@udecode/plate-heading';
import { BulletedListPlugin, NumberedListPlugin } from '@udecode/plate-list/react';
import { toggleList } from '@udecode/plate-list';

import { Icons } from './icons';
import {
  InlineCombobox,
  InlineComboboxContent,
  InlineComboboxEmpty,
  InlineComboboxInput,
  InlineComboboxItem,
} from './inline-combobox';

import { useToolbarContext } from '../../toolbar/toolbar-provider';

export interface SlashCommandRule {
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  onSelect: (editor: PlateEditor) => void;
  value: string;
  keywords?: string[];
}

const builtInRules: SlashCommandRule[] = [
  {
    icon: Icons.h1 as any,
    onSelect: (editor) => {
      editor.tf.toggleBlock(HEADING_KEYS.h1);
    },
    value: 'Heading 1',
  },
  {
    icon: Icons.h2 as any,
    onSelect: (editor) => {
      editor.tf.toggleBlock(HEADING_KEYS.h2);
    },
    value: 'Heading 2',
  },
  {
    icon: Icons.h3 as any,
    onSelect: (editor) => {
      editor.tf.toggleBlock(HEADING_KEYS.h3);
    },
    value: 'Heading 3',
  },
  {
    icon: Icons.ul as any,
    keywords: ['ul', 'unordered list'],
    onSelect: (editor) => {
      toggleList(editor, { type: BulletedListPlugin.key });
    },
    value: 'Bulleted list',
  },
  {
    icon: Icons.ol as any,
    keywords: ['ol', 'ordered list'],
    onSelect: (editor) => {
      toggleList(editor, { type: NumberedListPlugin.key });
    },
    value: 'Numbered list',
  },
];

export const SlashInputElement = withRef<typeof PlateElement>((props, ref) => {
  const { children, element } = props;

  const editor = useEditorRef() as PlateEditor;

  const { slashRules } = useToolbarContext();

  const rules = useMemo(() => {
    const extra = Array.isArray(slashRules) ? slashRules : [];
    return [...builtInRules, ...extra];
  }, [slashRules]);

  return (
    <PlateElement as='span' ref={ref} data-slate-value={(element as any).value} {...props}>
      <InlineCombobox element={element as any} trigger='/'>
        <InlineComboboxInput />

        <InlineComboboxContent>
          <InlineComboboxEmpty>No matching commands found</InlineComboboxEmpty>

          {rules.map(({ icon: Icon, onSelect, value }) => {
            const FinalIcon = (Icon ?? (Icons.add as any)) as any;

            return (
              <InlineComboboxItem
                key={value}
                value={value}
                onMouseDown={(e: any) => e.preventDefault()}
                onClick={(e: any) => {
                  e.preventDefault();
                  onSelect(editor);
                }}
              >
                <FinalIcon aria-hidden className='mr-2 size-4' />
                {value}
              </InlineComboboxItem>
            );
          })}
        </InlineComboboxContent>
      </InlineCombobox>

      {children}
    </PlateElement>
  );
});
