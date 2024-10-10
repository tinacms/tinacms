import React from 'react'

import type { DropdownMenuProps } from '@radix-ui/react-dropdown-menu'
import {
  collapseSelection,
  focusEditor,
  getNodeEntries,
  isBlock,
  toggleNodeType,
  useEditorRef,
  useEditorState,
  useEditorSelector,
} from '@udecode/plate-common'
import {
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
} from '@udecode/plate-heading'
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph'
import { ToolbarButton } from './plate-ui/toolbar'
import { helpers, unsupportedItemsInTable } from '../plugins/core/common'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  useOpenState,
} from './plate-ui/dropdown-menu'
import { Icons } from './plate-ui/icons'
import { ELEMENT_TABLE } from '@udecode/plate-table'

const items = [
  {
    description: 'Paragraph',
    icon: Icons.heading,
    label: 'Paragraph',
    value: ELEMENT_PARAGRAPH,
  },
  {
    description: 'Heading 1',
    icon: Icons.h1,
    label: 'Heading 1',
    value: ELEMENT_H1,
  },
  {
    description: 'Heading 2',
    icon: Icons.h2,
    label: 'Heading 2',
    value: ELEMENT_H2,
  },
  {
    description: 'Heading 3',
    icon: Icons.h3,
    label: 'Heading 3',
    value: ELEMENT_H3,
  },
  {
    description: 'Heading 4',
    icon: Icons.h4,
    label: 'Heading 4',
    value: ELEMENT_H4,
  },
  {
    description: 'Heading 5',
    icon: Icons.h5,
    label: 'Heading 5',
    value: ELEMENT_H5,
  },
  {
    description: 'Heading 6',
    icon: Icons.h6,
    label: 'Heading 6',
    value: ELEMENT_H6,
  },
]

const defaultItem =
  items.find((item) => item.value === ELEMENT_PARAGRAPH) || items[0]

export function HeadingsMenu(props: DropdownMenuProps) {
  const value: string = useEditorSelector((editor) => {
    let initialNodeType: string = ELEMENT_PARAGRAPH
    let allNodesMatchInitialNodeType = false
    const codeBlockEntries = getNodeEntries(editor, {
      match: (n) => isBlock(editor, n),
      mode: 'highest',
    })
    const nodes = Array.from(codeBlockEntries)

    if (nodes.length > 0) {
      initialNodeType = nodes[0][0].type as string
      allNodesMatchInitialNodeType = nodes.every(([node]) => {
        const type: string = (node?.type as string) || ELEMENT_PARAGRAPH

        return type === initialNodeType
      })
    }

    return allNodesMatchInitialNodeType ? initialNodeType : ELEMENT_PARAGRAPH
  }, [])

  const editor = useEditorRef()
  const editorState = useEditorState()
  const openState = useOpenState()

  const userInTable = helpers.isNodeActive(editorState, ELEMENT_TABLE)

  const selectedItem = items.find((item) => item.value === value) ?? defaultItem
  const { icon: SelectedItemIcon, label: selectedItemLabel } = selectedItem

  return (
    <DropdownMenu modal={false} {...openState} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton
          showArrow
          isDropdown
          pressed={openState.open}
          tooltip="Headings"
        >
          <SelectedItemIcon className="size-5" />
          <span className="@md/toolbar:flex hidden">{selectedItemLabel}</span>
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="min-w-0">
        <DropdownMenuRadioGroup
          className="flex flex-col gap-0.5"
          onValueChange={(type) => {
            toggleNodeType(editor, { activeType: type })
            collapseSelection(editor)
            focusEditor(editor)
          }}
          value={value}
        >
          {items
            .filter((item) => {
              if (userInTable) {
                return !unsupportedItemsInTable.has(item.label)
              }
              return true
            })
            .map(({ icon: Icon, label, value: itemValue }) => (
              <DropdownMenuRadioItem
                className="min-w-[180px]"
                key={itemValue}
                value={itemValue}
              >
                <Icon className="mr-2 size-5" />
                {label}
              </DropdownMenuRadioItem>
            ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
