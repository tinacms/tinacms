import {
  $getSelection,
  KEY_DELETE_COMMAND,
  type GridSelection,
  type NodeKey,
  type NodeSelection,
  type RangeSelection,
  COMMAND_PRIORITY_LOW,
  KEY_BACKSPACE_COMMAND,
  $getNodeByKey,
  CLICK_COMMAND,
} from 'lexical'

import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection'
import { $isNodeSelection } from 'lexical'
import * as React from 'react'
import { Suspense, useRef, useState } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $isImageNode } from '.'
import { mergeRegister } from '@lexical/utils'

const imageCache = new Set()

function useSuspenseImage(src: string) {
  if (!imageCache.has(src)) {
    throw new Promise((resolve) => {
      const img = new Image()
      img.src = src
      img.onload = () => {
        imageCache.add(src)
        resolve(null)
      }
    })
  }
}

function LazyImage({
  altText,
  className,
  imageRef,
  src,
}: {
  altText: string
  className?: string | null
  imageRef: { current: null | HTMLImageElement }
  src: string
}): JSX.Element {
  useSuspenseImage(src)
  return (
    <img
      className={className || undefined}
      src={src}
      alt={altText}
      ref={imageRef}
      draggable="false"
    />
  )
}

export default function ImageComponent({
  src,
  altText,
  nodeKey,
}: {
  altText: string
  nodeKey: NodeKey
  src: string
}): JSX.Element {
  const [editor] = useLexicalComposerContext()
  const imageRef = useRef<null | HTMLImageElement>(null)
  const [isSelected, setSelected, clearSelection] =
    useLexicalNodeSelection(nodeKey)
  const [_selection, setSelection] = useState<
    RangeSelection | NodeSelection | GridSelection | null
  >(null)

  const isFocused = isSelected
  const onDelete = React.useCallback(
    (payload: KeyboardEvent) => {
      if (isSelected && $isNodeSelection($getSelection())) {
        const event: KeyboardEvent = payload
        event.preventDefault()
        const node = $getNodeByKey(nodeKey)
        if ($isImageNode(node)) {
          if (node.isSelected()) {
            node.selectPrevious()
          }
          node.remove()
        }
      }
      return false
    },
    [isSelected, nodeKey]
  )

  React.useEffect(() => {
    const unregister = mergeRegister(
      editor.registerCommand(
        KEY_DELETE_COMMAND,
        onDelete,
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_BACKSPACE_COMMAND,
        onDelete,
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand<MouseEvent>(
        CLICK_COMMAND,
        (payload) => {
          const event = payload
          if (event.target === imageRef.current) {
            if (event.shiftKey) {
              setSelected(!isSelected)
            } else {
              clearSelection()
              setSelected(true)
            }
            return true
          }

          return false
        },
        COMMAND_PRIORITY_LOW
      )
    )
    return () => unregister()
  }, [editor, isSelected, nodeKey, setSelection])

  const baseClassNames = 'inline-block rounded-md'
  const classNames = isFocused ? 'border-blue-400' : 'border-gray-100'

  return (
    <Suspense
      fallback={
        <span
          title={src}
          className={`border p-1 ${classNames} ${baseClassNames} min-w-[4rem] min-h-[1rem] bg-gray-100 text-gray-600 truncate max-w-[300px]`}
        >
          {src}
        </span>
      }
    >
      <span className={`border-2 rounded-md ${classNames} ${baseClassNames}`}>
        <LazyImage src={src} altText={altText} imageRef={imageRef} />
      </span>
    </Suspense>
  )
}
