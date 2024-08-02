import React from 'react'

import { withRef } from '@udecode/cn'

import { Icons } from './icons'

import { ToolbarButton } from './toolbar'
import { toggleNodeType, useEditorState } from '@udecode/plate-common'
import { helpers } from '../../plugins/core/common'
import {
  ELEMENT_CODE_BLOCK,
  useCodeBlockElementState,
} from '@udecode/plate-code-block'
import { insertEmptyCodeBlock } from '../../transforms/insert-empty-block'

const useCodeBlockToolbarButtonState = () => {
  const editor = useEditorState()

  const isBlockActive = () => helpers.isNodeActive(editor, ELEMENT_CODE_BLOCK)

  return {
    pressed: isBlockActive(),
  }
}

const useCodeBlockToolbarButton = (state) => {
  const editor = useEditorState()

  const onClick = () => {
    // insertEmptyCodeBlock(editor);
    insertEmptyCodeBlock(editor)
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

export const CodeBlockToolbarButton = withRef<
  typeof ToolbarButton,
  {
    clear?: string | string[]
  }
>(({ clear, ...rest }, ref) => {
  const state = useCodeBlockToolbarButtonState()

  const { props } = useCodeBlockToolbarButton(state)

  return (
    <ToolbarButton ref={ref} tooltip="Link" {...rest} {...props}>
      <Icons.codeBlock />
    </ToolbarButton>
  )
})
