import React from 'react'
import { Transforms } from 'slate'
import { useSelected, ReactEditor } from 'slate-react'
import { isHotkey } from 'is-hotkey'
import { useCMS, useEvent } from '@toolkit/react-core'
import { FieldFocusEvent } from '@toolkit/fields/field-events'

const handleCloseBase = (editor, element) => {
  const path = ReactEditor.findPath(editor, element)
  const editorEl = ReactEditor.toDOMNode(editor, editor)
  if (editorEl) {
    /**
     * FIXME: there must be a better way to do this. When jumping
     * back from a nested form, the entire editor doesn't receive
     * focus, so enable that, but what we also want is to ensure
     * that this node is selected - so do that, too. But there
     * seems to be a race condition where the `editorEl.focus` doesn't
     * happen in time for the Transform to take effect, hence the
     * setTimeout. I _think_ it just needs to queue and the actual
     * ms timeout is irrelevant, but might be worth checking on
     * devices with lower CPUs
     */
    editorEl.focus()
    setTimeout(() => {
      Transforms.select(editor, path)
    }, 1)
  }
}

const handleRemoveBase = (editor, element) => {
  const path = ReactEditor.findPath(editor, element)
  Transforms.removeNodes(editor, {
    at: path,
  })
}

export const useHotkey = (key, callback) => {
  const selected = useSelected()

  React.useEffect(() => {
    const handleEnter = (e) => {
      if (selected) {
        if (isHotkey(key, e)) {
          e.preventDefault()
          callback()
        }
      }
    }
    document.addEventListener('keydown', handleEnter)

    return () => document.removeEventListener('keydown', handleEnter)
  }, [selected])
}

export const useEmbedHandles = (editor, element, baseFieldName: string) => {
  const cms = useCMS()
  const { dispatch: setFocusedField } = useEvent<FieldFocusEvent>('field:focus')
  const [isExpanded, setIsExpanded] = React.useState(false)

  const handleClose = () => {
    setIsExpanded(false)
    handleCloseBase(editor, element)
  }

  const path = ReactEditor.findPath(editor, element)
  const fieldName = `${baseFieldName}.children.${path.join('.children.')}.props`
  const handleSelect = () => {
    cms.dispatch({
      type: 'forms:set-active-field-name',
      value: {
        formId: cms.state.activeFormId,
        fieldName,
      },
    })
    setFocusedField({
      id: cms.state.activeFormId,
      fieldName,
    })
  }

  const handleRemove = () => {
    handleRemoveBase(editor, element)
  }

  return { isExpanded, handleClose, handleRemove, handleSelect }
}
