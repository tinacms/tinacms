/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { $isNestedNode, NestedNode } from './nestedNode'

// import {useCollaborationContext} from '@lexical/react/LexicalCollaborationContext';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection'
import { mergeRegister } from '@lexical/utils'
import {
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  GridSelection,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  NodeKey,
  NodeSelection,
  RangeSelection,
} from 'lexical'
import * as React from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { classNames } from '../toolbar'
import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { createPortal } from 'react-dom'

const NestedComponent = ({ nodeKey }: { nodeKey: string }) => {
  const [editor] = useLexicalComposerContext()
  const [isSelected, setSelected, clearSelection] =
    useLexicalNodeSelection(nodeKey)
  const [selection, setSelection] = useState<
    RangeSelection | NodeSelection | GridSelection | null
  >(null)
  const ref = useRef(null)

  const onDelete = useCallback(
    (payload: KeyboardEvent) => {
      if (isSelected && $isNodeSelection($getSelection())) {
        const event: KeyboardEvent = payload
        event.preventDefault()
        const node = $getNodeByKey(nodeKey)
        if ($isNestedNode(node)) {
          node.remove()
        }
        setSelected(false)
      }
      return false
    },
    [isSelected, nodeKey, setSelected]
  )

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        setSelection(editorState.read(() => $getSelection()))
      }),
      editor.registerCommand<MouseEvent>(
        CLICK_COMMAND,
        (payload) => {
          const event = payload

          if (event.target === ref.current) {
            if (!event.shiftKey) {
              clearSelection()
            }
            setSelected(true)
            // setSelected(!isSelected);
            return true
          }

          return false
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_DELETE_COMMAND,
        onDelete,
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_BACKSPACE_COMMAND,
        onDelete,
        COMMAND_PRIORITY_LOW
      )
    )
  }, [clearSelection, editor, isSelected, nodeKey, onDelete, setSelected])

  // const isFocused = $isNodeSelection(selection);
  const isFocused = $isNodeSelection(selection) && isSelected
  // console.log($isNodeSelection(selection));
  // console.log({ isSelected });
  // const isFocused = true;

  return (
    // <span
    //   ref={ref}
    //   className={classNames(
    //     isFocused
    //       ? "border-indigo-500 ring-2 ring-indigo-500"
    //       : "hover:cursor-pointer hover:border-indigo-300 hover:ring-2 hover:ring-indigo-300",
    //     "min-w-[20px] bg-gray-200 rounded-md shadow-lg inline-block"
    //   )}
    // >
    //   <span className="break-word">A</span>
    // </span>
    <Menu
      as="span"
      ref={ref}
      className={classNames(
        isFocused
          ? 'border-indigo-500 ring-2 ring-indigo-500'
          : 'hover:cursor-pointer hover:border-indigo-300 hover:ring-2 hover:ring-indigo-300',
        'min-w-[20px] bg-gray-200 rounded-md shadow-lg inline-block relative inline-flex shadow-sm rounded-md leading-none'
      )}
    >
      {/* <span className="relative inline-flex shadow-sm rounded-md leading-none"> */}
      <span className="truncate cursor-pointer relative inline-flex items-center justify-start px-2 py-0.5 rounded-l-md border border-gray-200 bg-white  hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
        Options
      </span>
      <Menu.Button className="cursor-pointer h-full relative inline-flex items-center px-1 py-0.5 rounded-r-md border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
        <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
      </Menu.Button>
      {/* </span> */}

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute top-full right-0 z-10 mt-2 w-36 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  type="button"
                  className={classNames(
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                    'w-full text-left block px-4 py-2 text-sm'
                  )}
                >
                  Edit
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  type="button"
                  className={classNames(
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                    'w-full text-left block px-4 py-2 text-sm'
                  )}
                >
                  Remove
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}
export default NestedComponent
