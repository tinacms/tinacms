import { withRef } from '@udecode/cn'
import {
  type PlateEditor,
  type TElement,
  getPluginType,
  insertEmptyElement,
  insertNode,
  isSelectionAtBlockStart,
  setElements,
  someNode,
  useEditorState,
} from '@udecode/plate-common'
import React from 'react'
import { helpers } from '../../plugins/core/common'
import { ELEMENT_MERMAID } from '../../plugins/custom/mermaid-plugin'
import { Icons } from './icons'
import { ToolbarButton } from './toolbar'

export const insertEmptyMermaid = (editor: PlateEditor) => {
  const matchCodeElements = (node: TElement) =>
    node.type === getPluginType(editor, ELEMENT_MERMAID)

  if (
    someNode(editor, {
      match: matchCodeElements,
    })
  ) {
    return
  }

  const node = {
    type: ELEMENT_MERMAID,
    value: '',
    children: [{ type: 'text', text: '' }],
  }

  if (isSelectionAtBlockStart(editor)) {
    setElements(editor, node)
  } else {
    insertNode(editor, node)
  }
}

const useMermaidToolbarButtonState = () => {
  const editor = useEditorState()

  const isBlockActive = () => helpers.isNodeActive(editor, ELEMENT_MERMAID)

  return {
    pressed: isBlockActive(),
  }
}

const useMermaidToolbarButton = (state) => {
  const editor = useEditorState()

  const onClick = () => {
    insertEmptyElement(editor, ELEMENT_MERMAID, {
      nextBlock: true,
      select: true,
    })
  }

  const onMouseDown = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  return {
    props: {
      onClick,
      onMouseDown,
      pressed: state.pressed,
    },
  }
}

export const MermaidToolbarButton = withRef<
  typeof ToolbarButton,
  {
    clear?: string | string[]
  }
>(({ clear, ...rest }, ref) => {
  const state = useMermaidToolbarButtonState()

  const { props } = useMermaidToolbarButton(state)

  return (
    <ToolbarButton ref={ref} tooltip="Mermaid" {...rest} {...props}>
      <Icons.mermaid />
    </ToolbarButton>
  )
})
