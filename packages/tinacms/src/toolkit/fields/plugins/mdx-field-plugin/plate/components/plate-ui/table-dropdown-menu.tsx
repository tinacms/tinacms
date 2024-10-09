import React from 'react'

import type { DropdownMenuProps } from '@radix-ui/react-dropdown-menu'

import {
  isElement,
  focusEditor,
  someNode,
  findNode,
  useEditorRef,
  useEditorSelector,
} from '@udecode/plate-common'
import {
  ELEMENT_TABLE,
  getTableColumnCount,
  deleteColumn,
  deleteRow,
  deleteTable,
  insertTable,
  insertTableColumn,
  insertTableRow,
} from '@udecode/plate-table'

import { Icons, iconVariants } from './icons'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  useOpenState,
} from './dropdown-menu'
import { ToolbarButton } from './toolbar'

export function TableDropdownMenu(props: DropdownMenuProps) {
  const tableSelected = useEditorSelector(
    (editor) => someNode(editor, { match: { type: ELEMENT_TABLE } }),
    []
  )

  const [enableDeleteColumn, enableDeleteRow] = useEditorSelector((editor) => {
    const tableNodeEntry = findNode(editor, { match: { type: ELEMENT_TABLE } })
    if (!tableNodeEntry) return [false, false]

    const [tableNode] = tableNodeEntry
    if (!isElement(tableNode)) return [false, false]

    const columnCount = getTableColumnCount(tableNode)
    const rowCount = tableNode.children.length
    return [columnCount > 1, rowCount > 1]
  }, [])

  const editor = useEditorRef()
  const openState = useOpenState()

  return (
    <DropdownMenu modal={false} {...openState} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton isDropdown pressed={openState.open} tooltip="Table">
          <Icons.table />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="flex w-[180px] min-w-0 flex-col gap-0.5"
      >
        <DropdownMenuItem
          className="min-w-[180px]"
          disabled={tableSelected}
          onSelect={() => {
            insertTable(editor)
            focusEditor(editor)
          }}
        >
          <Icons.add className={iconVariants({ variant: 'menuItem' })} />
          Insert table
        </DropdownMenuItem>
        <DropdownMenuItem
          className="min-w-[180px]"
          disabled={!tableSelected}
          onSelect={() => {
            deleteTable(editor)
            focusEditor(editor)
          }}
        >
          <Icons.minus className={iconVariants({ variant: 'menuItem' })} />
          Delete table
        </DropdownMenuItem>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger disabled={!tableSelected}>
            <Icons.column className={iconVariants({ variant: 'menuItem' })} />
            <span>Column</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem
              className="min-w-[180px]"
              disabled={!tableSelected}
              onSelect={() => {
                insertTableColumn(editor)
                focusEditor(editor)
              }}
            >
              <Icons.add className={iconVariants({ variant: 'menuItem' })} />
              Insert column after
            </DropdownMenuItem>
            <DropdownMenuItem
              className="min-w-[180px]"
              disabled={!enableDeleteColumn}
              onSelect={() => {
                deleteColumn(editor)
                focusEditor(editor)
              }}
            >
              <Icons.minus className={iconVariants({ variant: 'menuItem' })} />
              Delete column
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger disabled={!tableSelected}>
            <Icons.row className={iconVariants({ variant: 'menuItem' })} />
            <span>Row</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem
              className="min-w-[180px]"
              disabled={!tableSelected}
              onSelect={() => {
                insertTableRow(editor)
                focusEditor(editor)
              }}
            >
              <Icons.add className={iconVariants({ variant: 'menuItem' })} />
              Insert row after
            </DropdownMenuItem>
            <DropdownMenuItem
              className="min-w-[180px]"
              disabled={!enableDeleteRow}
              onSelect={() => {
                deleteRow(editor)
                focusEditor(editor)
              }}
            >
              <Icons.minus className={iconVariants({ variant: 'menuItem' })} />
              Delete row
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
