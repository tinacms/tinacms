/**
Copyright 2021 Forestry.io Holdings, Inc.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React from 'react'
import { Transforms } from 'slate'
import { useSelected, ReactEditor } from 'slate-react'
import isHotkey from 'is-hotkey'

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

export const useEmbedHandles = (editor, element) => {
  const [isExpanded, setIsExpanded] = React.useState(false)

  const handleClose = () => {
    setIsExpanded(false)
    handleCloseBase(editor, element)
  }

  const handleSelect = (e) => {
    e.preventDefault()
    setIsExpanded(true)
  }

  const handleRemove = () => {
    handleRemoveBase(editor, element)
  }

  return { isExpanded, handleClose, handleRemove, handleSelect }
}
