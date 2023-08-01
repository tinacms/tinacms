import * as React from 'react'
import {
  getEditorString,
  isEditorFocused,
  useEditorState,
} from '@udecode/plate-headless'
import { Range } from 'slate'
import { computePosition, flip, shift } from '@floating-ui/dom'

export const FloatingToolbarWrapper = ({
  children,
  position,
}: {
  children: JSX.Element
  position?: 'top' | 'bottom'
}) => {
  const ref = React.useRef<HTMLDivElement | null>()
  const editor = useEditorState()
  const { selection } = editor

  React.useEffect(() => {
    const el = ref.current

    if (!el) {
      return
    }

    if (
      !selection ||
      !isEditorFocused(editor) ||
      Range.isCollapsed(selection) ||
      getEditorString(editor, selection) === ''
    ) {
      el.classList.add('hidden')
      el.classList.remove('block')
      return
    }

    el.classList.add('block')
    el.classList.remove('hidden')
    const run = async () => {
      if (ref.current) {
        const domSelection = window.getSelection()
        const domRange = domSelection.getRangeAt(0)
        const { x, y } = await computePosition(domRange, ref.current, {
          placement: position || 'top',
          middleware: [flip(), shift()],
        })
        Object.assign(ref.current.style, {
          left: `${x}px`,
          top: `${y}px`,
        })
      }
    }
    run()
  }, [JSON.stringify(selection), ref.current])

  return (
    <div ref={ref} className="absolute z-10">
      {children}
    </div>
  )
}
