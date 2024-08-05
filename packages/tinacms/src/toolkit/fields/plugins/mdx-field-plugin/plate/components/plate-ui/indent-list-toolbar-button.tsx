import React from 'react'
import { withRef } from '@udecode/cn'
import { Icons } from './icons'
import {
  type ELEMENT_OL,
  ELEMENT_UL,
  toggleList,
  useListToolbarButton,
  useListToolbarButtonState,
} from '@udecode/plate'
import { ToolbarButton } from './toolbar'
import { useEditorState } from '@udecode/plate-common'

export const IndentListToolbarButton = withRef<
  typeof ToolbarButton,
  {
    nodeType?: typeof ELEMENT_UL | typeof ELEMENT_OL
  }
>(({ nodeType = ELEMENT_UL }, ref) => {
  const editor = useEditorState()
  const state = useListToolbarButtonState({ nodeType })
  const { props } = useListToolbarButton(state)

  return (
    <ToolbarButton
      ref={ref}
      tooltip={nodeType === ELEMENT_UL ? 'Bulleted List' : 'Numbered List'}
      {...props}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleList(editor, { type: nodeType })
      }}
    >
      {nodeType === ELEMENT_UL ? <Icons.ul /> : <Icons.ol />}
    </ToolbarButton>
  )
})
