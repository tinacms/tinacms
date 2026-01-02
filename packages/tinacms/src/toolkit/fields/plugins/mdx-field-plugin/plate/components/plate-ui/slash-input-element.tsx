'use client'

import React, { type ComponentType, useMemo } from 'react'
import { withRef } from '@udecode/cn'
import {
  PlateElement,
  useEditorRef,
  type PlateEditor,
} from '@udecode/plate/react'
import { HEADING_KEYS } from '@udecode/plate-heading'
import {
  BulletedListPlugin,
  NumberedListPlugin,
} from '@udecode/plate-list/react'
import { toggleList } from '@udecode/plate-list'

import { Icons } from './icons'
import {
  InlineCombobox,
  InlineComboboxContent,
  InlineComboboxEmpty,
  InlineComboboxInput,
  InlineComboboxItem,
} from './inline-combobox'

import { useToolbarContext } from '../../toolbar/toolbar-provider'

export interface SlashCommandRule {
  icon?: ComponentType
  onSelect: (editor: PlateEditor) => void
  value: string
  keywords?: string[]
}

const builtInRules: SlashCommandRule[] = [
  {
    icon: Icons.h1,
    onSelect: (editor) => {
      editor.tf.toggleBlock(HEADING_KEYS.h1)
    },
    value: 'Heading 1',
  },
  {
    icon: Icons.h2,
    onSelect: (editor) => {
      editor.tf.toggleBlock(HEADING_KEYS.h2)
    },
    value: 'Heading 2',
  },
  {
    icon: Icons.h3,
    onSelect: (editor) => {
      editor.tf.toggleBlock(HEADING_KEYS.h3)
    },
    value: 'Heading 3',
  },
  {
    icon: Icons.ul,
    keywords: ['ul', 'unordered list'],
    onSelect: (editor) => {
      toggleList(editor, { type: BulletedListPlugin.key })
    },
    value: 'Bulleted list',
  },
  {
    icon: Icons.ol,
    keywords: ['ol', 'ordered list'],
    onSelect: (editor) => {
      toggleList(editor, { type: NumberedListPlugin.key })
    },
    value: 'Numbered list',
  },
]

export const SlashInputElement = withRef<typeof PlateElement>((props, ref) => {
  const { children, element } = props
  const editor = useEditorRef()
  const { slashRules } = useToolbarContext()

  const rules = useMemo(() => {
    const extra = Array.isArray(slashRules) ? slashRules : []
    return [...builtInRules, ...extra]
  }, [slashRules])

  return (
    <PlateElement
      as="span"
      ref={ref}
      data-slate-value={element.value}
      {...props}
    >
      <InlineCombobox element={element} trigger="/">
        <InlineComboboxInput />

        <InlineComboboxContent>
          <InlineComboboxEmpty>No matching commands found</InlineComboboxEmpty>

          {rules.map(({ icon: Icon = Icons.add, onSelect, value, keywords }) => (
            <InlineComboboxItem
              key={value}
              value={value}
              keywords={keywords}
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => {
                e.preventDefault()
                onSelect(editor)
              }}
            >
              <Icon aria-hidden className="mr-2 size-4" />
              {value}
            </InlineComboboxItem>
          ))}
        </InlineComboboxContent>
      </InlineCombobox>

      {children}
    </PlateElement>
  )
})
