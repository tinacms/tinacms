/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

// import {
//   $isAutoHighlightNode,
//   $isHighlightNode,
//   TOGGLE_HIGHLIGHT_COMMAND,
// } from "@lexical/link";
import {
  $isHighlightNode,
  $isAutoHighlightNode,
  TOGGLE_HIGHLIGHT_COMMAND,
} from './highlightNode'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $findMatchingParent, mergeRegister } from '@lexical/utils'
import {
  $getNearestNodeFromDOMNode,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  GridSelection,
  KEY_ESCAPE_COMMAND,
  LexicalEditor,
  NodeSelection,
  RangeSelection,
  SELECTION_CHANGE_COMMAND,
} from 'lexical'
import { Dispatch, useCallback, useEffect, useRef, useState } from 'react'
import * as React from 'react'
import { createPortal } from 'react-dom'
import { RadioGroup, Transition } from '@headlessui/react'

// import LinkPreview from '../../ui/LinkPreview';
import { classNames, getSelectedNode } from '../toolbar'
// import {setFloatingElemPosition} from '../../utils/setFloatingElemPosition';
import { toggleHighlight } from './highlightNode'

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
const VERTICAL_GAP = 3
const HORIZONTAL_OFFSET = 5

export function setFloatingElemPosition(
  targetRect: ClientRect | null,
  floatingElem: HTMLElement,
  anchorElem: HTMLElement,
  verticalGap: number = VERTICAL_GAP,
  horizontalOffset: number = HORIZONTAL_OFFSET
): void {
  const scrollerElem = anchorElem.parentElement

  if (targetRect === null || !scrollerElem) {
    floatingElem.style.opacity = '0'
    floatingElem.style.transform = 'translate(-10000px, -10000px)'
    return
  }

  const floatingElemRect = floatingElem.getBoundingClientRect()
  const anchorElementRect = anchorElem.getBoundingClientRect()
  const editorScrollerRect = scrollerElem.getBoundingClientRect()

  let top = targetRect.top - floatingElemRect.height - verticalGap
  // let left = targetRect.left + targetRect.width - floatingElemRect.width;
  let left = targetRect.left

  // if (top < editorScrollerRect.top) {
  top += floatingElemRect.height + targetRect.height + verticalGap * 2
  // }

  if (left + floatingElemRect.width > editorScrollerRect.right) {
    left = editorScrollerRect.right - floatingElemRect.width - horizontalOffset
  }

  top -= anchorElementRect.top
  // left -= anchorElementRect.left;

  floatingElem.style.opacity = '1'
  floatingElem.style.transform = `translate(${left}px, ${top}px)`
}

const colors = [
  { name: 'Pink', bgColor: 'bg-pink-500', selectedColor: 'ring-pink-500' },
  {
    name: 'Purple',
    bgColor: 'bg-purple-500',
    selectedColor: 'ring-purple-500',
  },
  { name: 'Blue', bgColor: 'bg-blue-500', selectedColor: 'ring-blue-500' },
  { name: 'Green', bgColor: 'bg-green-500', selectedColor: 'ring-green-500' },
  {
    name: 'Yellow',
    bgColor: 'bg-yellow-500',
    selectedColor: 'ring-yellow-500',
  },
]

function FloatingLinkEditor({
  editor,
  isLink,
  setIsLink,
  anchorElem,
}: {
  editor: LexicalEditor
  isLink: boolean
  setIsLink: Dispatch<boolean>
  anchorElem: HTMLElement
}): JSX.Element {
  const editorRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [linkUrl, setLinkUrl] = useState('')
  const [isEditMode, setEditMode] = useState(false)
  const [selectedColor, setSelectedColor] = useState(colors[1])
  const [lastSelection, setLastSelection] = useState<
    RangeSelection | GridSelection | NodeSelection | null
  >(null)

  const updateLinkEditor = useCallback(() => {
    const selection = $getSelection()
    let nodeElem: HTMLElement | null = null
    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection)
      const parent = node.getParent()
      if ($isHighlightNode(parent)) {
        nodeElem = editor.getElementByKey(parent.getKey())
        setLinkUrl(parent.getColor())
      } else if ($isHighlightNode(node)) {
        setLinkUrl(node.getColor())
      } else {
        setLinkUrl('')
      }
    }
    const editorElem = editorRef.current
    const nativeSelection = window.getSelection()
    const activeElement = document.activeElement

    if (editorElem === null) {
      return
    }

    const rootElement = editor.getRootElement()

    if (
      selection !== null &&
      nativeSelection !== null &&
      rootElement !== null &&
      rootElement.contains(nativeSelection.anchorNode) &&
      editor.isEditable()
    ) {
      const domRange = nativeSelection.getRangeAt(0)
      // let rect;
      // if (nativeSelection.anchorNode === rootElement) {
      //   let inner = rootElement;
      //   while (inner.firstElementChild != null) {
      //     inner = inner.firstElementChild as HTMLElement;
      //   }
      //   rect = inner.getBoundingClientRect();
      // } else {
      //   rect = domRange.getBoundingClientRect();
      // }
      let rect
      if (nodeElem) {
        rect = nodeElem?.getBoundingClientRect()
      } else {
        rect = domRange.getBoundingClientRect()
      }

      setFloatingElemPosition(rect, editorElem, anchorElem)
      setLastSelection(selection)
    } else if (!activeElement || activeElement.className !== 'link-input') {
      if (rootElement !== null) {
        setFloatingElemPosition(null, editorElem, anchorElem)
      }
      setLastSelection(null)
      setEditMode(false)
      setLinkUrl('')
    }

    return true
  }, [anchorElem, editor])

  useEffect(() => {
    const scrollerElem = anchorElem.parentElement

    const update = () => {
      editor.getEditorState().read(() => {
        updateLinkEditor()
      })
    }

    window.addEventListener('resize', update)

    if (scrollerElem) {
      scrollerElem.addEventListener('scroll', update)
    }

    return () => {
      window.removeEventListener('resize', update)

      if (scrollerElem) {
        scrollerElem.removeEventListener('scroll', update)
      }
    }
  }, [anchorElem.parentElement, editor, updateLinkEditor])

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateLinkEditor()
        })
      }),

      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateLinkEditor()
          return true
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_ESCAPE_COMMAND,
        () => {
          if (isLink) {
            setIsLink(false)
            return true
          }
          return false
        },
        COMMAND_PRIORITY_HIGH
      )
    )
  }, [editor, updateLinkEditor, setIsLink, isLink])

  useEffect(() => {
    editor.getEditorState().read(() => {
      updateLinkEditor()
    })
  }, [editor, updateLinkEditor])

  useEffect(() => {
    if (isEditMode && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditMode])
  return (
    <button
      ref={editorRef}
      className="absolute z-10 top-0 left-0 bg-white shadow-lg rounded-md py-1 px-2 bg-blue-500 text-white flex"
    >
      <span className="uppercase text-xs font-bold tracking-wide">Edit</span>
    </button>
  )

  return (
    <div
      ref={editorRef}
      className="absolute z-10 top-0 left-0 bg-white shadow-lg rounded-md"
    >
      <>
        <div className="min-w-[100px] min-h-[100px] px-4 py-6 space-y-2">
          <div className="mt-1">
            <RadioGroup
              value={selectedColor}
              onChange={(value) => {
                // editor.dispatchCommand(TOGGLE_HIGHLIGHT_COMMAND, value.bgColor);
                editor.dispatchCommand(TOGGLE_HIGHLIGHT_COMMAND, value.bgColor)
                setSelectedColor(value)
              }}
            >
              <RadioGroup.Label className="block text-sm font-medium text-gray-700">
                Choose a label color
              </RadioGroup.Label>
              <div className="mt-4 flex items-center space-x-3">
                {colors.map((color) => (
                  <RadioGroup.Option
                    key={color.name}
                    value={color}
                    className={({ active, checked }) =>
                      classNames(
                        color.selectedColor,
                        active && checked ? 'ring ring-offset-1' : '',
                        !active && checked ? 'ring-2' : '',
                        '-m-0.5 relative p-0.5 rounded-full flex items-center justify-center cursor-pointer focus:outline-none'
                      )
                    }
                  >
                    <RadioGroup.Label as="span" className="sr-only">
                      {color.name}
                    </RadioGroup.Label>
                    <span
                      aria-hidden="true"
                      className={classNames(
                        color.bgColor,
                        'h-8 w-8 border border-black border-opacity-10 rounded-full'
                      )}
                    />
                  </RadioGroup.Option>
                ))}
              </div>
            </RadioGroup>
          </div>
        </div>
      </>
    </div>
  )
}

function useFloatingLinkEditorToolbar(
  editor: LexicalEditor,
  anchorElem: HTMLElement
): JSX.Element | null {
  const [activeEditor, setActiveEditor] = useState(editor)
  const [isLink, setIsLink] = useState(false)

  const updateToolbar = useCallback(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection)
      const linkParent = $findMatchingParent(node, $isHighlightNode)
      const autoLinkParent = $findMatchingParent(node, $isAutoHighlightNode)

      // We don't want this menu to open for auto links.
      if (linkParent != null && autoLinkParent == null) {
        setIsLink(true)
      } else {
        setIsLink(false)
      }
    }
  }, [])

  useEffect(() => {
    return editor.registerCommand(
      TOGGLE_HIGHLIGHT_COMMAND,
      (_payload, newEditor) => {
        console.log('goooo', _payload)
        // updateToolbar();
        // setActiveEditor(newEditor);
        toggleHighlight(_payload)
        return false
      },
      COMMAND_PRIORITY_CRITICAL
    )
  }, [editor, updateToolbar])

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, newEditor) => {
        updateToolbar()
        setActiveEditor(newEditor)
        return false
      },
      COMMAND_PRIORITY_CRITICAL
    )
  }, [editor, updateToolbar])

  return isLink
    ? createPortal(
        <FloatingLinkEditor
          editor={activeEditor}
          isLink={isLink}
          anchorElem={anchorElem}
          setIsLink={setIsLink}
        />,
        anchorElem
      )
    : null
}

export default function FloatingLinkEditorPlugin({
  anchorElem = document.body,
}: {
  anchorElem?: HTMLElement
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext()
  // return useFloatingLinkEditorToolbar(editor, anchorElem);
  return useFloatingLinkEditorToolbar(editor, document.body)
}
