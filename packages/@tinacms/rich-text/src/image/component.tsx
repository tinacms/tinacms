import type {
  GridSelection,
  NodeKey,
  NodeSelection,
  RangeSelection,
} from 'lexical'

import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection'
import { $isNodeSelection } from 'lexical'
import * as React from 'react'
import { Suspense, useRef, useState } from 'react'

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
  className: string | null
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
  const imageRef = useRef<null | HTMLImageElement>(null)
  const [isSelected] = useLexicalNodeSelection(nodeKey)
  const [selection, setSelection] = useState<
    RangeSelection | NodeSelection | GridSelection | null
  >(null)

  const isFocused = isSelected
  const classNames =
    $isNodeSelection(selection) && isFocused ? 'bg-blue-400' : 'bg-gray-100'

  // console.log(nodeKey, isSelected)

  return (
    <Suspense fallback={null}>
      <span className={`${classNames} inline-block p-1 rounded-md`}>
        <LazyImage
          className={`${
            isFocused
              ? `focused ${$isNodeSelection(selection) ? 'draggable' : ''}`
              : null
          } rounded-sm`}
          src={src}
          altText={altText}
          imageRef={imageRef}
        />
      </span>
    </Suspense>
  )
}
