import {
  $getRoot,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isRootOrShadowRoot,
  EditorConfig,
  EditorState,
  GridSelection,
  LexicalNode,
  TextNode,
} from 'lexical'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
// import MentionsPlugin from "../plugins/mentionsPlugin";

// import { MentionNode } from "../plugins/mentionsNode";
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table'
import { INSERT_TABLE_COMMAND } from '@lexical/table'
import { ListItemNode, ListNode, insertList } from '@lexical/list'
// import { insertList } from "../list-item/format-list";
import { CodeHighlightNode, CodeNode } from '@lexical/code'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { AutoLinkNode, LinkNode } from '@lexical/link'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { TRANSFORMERS } from '@lexical/markdown'
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
// import CodeHighlightPlugin from "../plugins/codeHighlight";
// import TreeViewPlugin from "../plugins/treeView";
import utils from '@lexical/utils'
import React from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { createPortal } from 'react-dom'

import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  HeadingTagType,
} from '@lexical/rich-text'

import { useState, useCallback, useEffect } from 'react'
import type { LexicalEditor, NodeKey } from 'lexical'
import {
  $findMatchingParent,
  $getNearestBlockElementAncestorOrThrow,
  $getNearestNodeOfType,
  mergeRegister,
} from '@lexical/utils'
import {
  $isListNode,
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from '@lexical/list'
import {
  $getSelectionStyleValueForProperty,
  $isParentElementRTL,
  $patchStyleText,
  $selectAll,
  $wrapNodes,
} from '@lexical/selection'

import { $isAtNodeEnd, $setBlocksType_experimental } from '@lexical/selection'
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link'
import { ElementNode, RangeSelection } from 'lexical'
import {
  $createParagraphNode,
  $getNodeByKey,
  $isTextNode,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  DEPRECATED_$isGridSelection,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  INDENT_CONTENT_COMMAND,
  OUTDENT_CONTENT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from 'lexical'

import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'

type ToolbarItem = {
  key: string
  active?: boolean
  onClick?: () => void
  label: string | JSX.Element
  icon?: JSX.Element
  children?: ToolbarItem[]
}

const blockTypeToBlockName = {
  bullet: 'Bulleted List',
  check: 'Check List',
  code: 'Code Block',
  h1: 'Heading 1',
  h2: 'Heading 2',
  h3: 'Heading 3',
  h4: 'Heading 4',
  h5: 'Heading 5',
  h6: 'Heading 6',
  number: 'Numbered List',
  paragraph: 'Normal',
  quote: 'Quote',
}

export function getSelectedNode(
  selection: RangeSelection
): TextNode | ElementNode {
  const anchor = selection.anchor
  const focus = selection.focus
  const anchorNode = selection.anchor.getNode()
  const focusNode = selection.focus.getNode()
  if (anchorNode === focusNode) {
    return anchorNode
  }
  const isBackward = selection.isBackward()
  if (isBackward) {
    return $isAtNodeEnd(focus) ? anchorNode : focusNode
  } else {
    return $isAtNodeEnd(anchor) ? focusNode : anchorNode
  }
}

import {
  $createCodeNode,
  $isCodeNode,
  CODE_LANGUAGE_FRIENDLY_NAME_MAP,
  CODE_LANGUAGE_MAP,
  getLanguageFriendlyName,
} from '@lexical/code'
import {
  BoldIcon,
  CodeBlockIcon,
  CodeIcon,
  EllipsisIcon,
  HeadingIcon,
  ImageIcon,
  ItalicIcon,
  LinkIcon,
  OrderedListIcon,
  QuoteIcon,
  RawMarkdown,
  TableIcon,
  UnorderedListIcon,
} from './icons'
import { $createTinaQuoteNode } from '../quote'
import { $createTinaParagraphNode } from '../paragraph'
import { $isListItemNode } from '../list-item'
// import { INSERT_IMAGE_COMMAND } from "../../plugins/image-plugin/plugin";

export const Toolbar = () => {
  const [editor] = useLexicalComposerContext()
  const [activeEditor, setActiveEditor] = useState(editor)
  const [blockType, setBlockType] =
    useState<keyof typeof blockTypeToBlockName>('paragraph')
  const [selectedElementKey, setSelectedElementKey] = useState<NodeKey | null>(
    null
  )
  const [fontSize, setFontSize] = useState<string>('15px')
  const [fontColor, setFontColor] = useState<string>('#000')
  const [bgColor, setBgColor] = useState<string>('#fff')
  const [fontFamily, setFontFamily] = useState<string>('Arial')
  const [isLink, setIsLink] = useState(false)
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const [isStrikethrough, setIsStrikethrough] = useState(false)
  const [isSubscript, setIsSubscript] = useState(false)
  const [isSuperscript, setIsSuperscript] = useState(false)
  const [isCode, setIsCode] = useState(false)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  // const [modal, showModal] = useModal();
  const [isRTL, setIsRTL] = useState(false)
  const [codeLanguage, setCodeLanguage] = useState<string>('')
  const [isEditable, setIsEditable] = useState(() => editor.isEditable())

  const updateToolbar = useCallback(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode()
      let element =
        anchorNode.getKey() === 'root'
          ? anchorNode
          : $findMatchingParent(anchorNode, (e) => {
              const parent = e.getParent()
              return parent !== null && $isRootOrShadowRoot(parent)
            })

      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow()
      }

      const elementKey = element.getKey()
      const elementDOM = activeEditor.getElementByKey(elementKey)

      // Update text format
      setIsBold(selection.hasFormat('bold'))
      setIsItalic(selection.hasFormat('italic'))
      setIsUnderline(selection.hasFormat('underline'))
      setIsStrikethrough(selection.hasFormat('strikethrough'))
      setIsSubscript(selection.hasFormat('subscript'))
      setIsSuperscript(selection.hasFormat('superscript'))
      setIsCode(selection.hasFormat('code'))
      setIsRTL($isParentElementRTL(selection))

      // Update links
      const node = getSelectedNode(selection)
      const parent = node.getParent()
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true)
      } else {
        setIsLink(false)
      }

      if (elementDOM !== null) {
        setSelectedElementKey(elementKey)
        const parentList = $getNearestNodeOfType<ListNode>(anchorNode, ListNode)
        const type = parentList
          ? parentList.getListType()
          : $isHeadingNode(element)
          ? element.getTag()
          : element.getType()
        if (type in blockTypeToBlockName) {
          setBlockType(type as keyof typeof blockTypeToBlockName)
        }
        if ($isCodeNode(element)) {
          const language =
            element.getLanguage() as keyof typeof CODE_LANGUAGE_MAP
          setCodeLanguage(
            language ? CODE_LANGUAGE_MAP[language] || language : ''
          )
          return
        }
      }
      // Handle buttons
      setFontSize(
        $getSelectionStyleValueForProperty(selection, 'font-size', '15px')
      )
      setFontColor(
        $getSelectionStyleValueForProperty(selection, 'color', '#000')
      )
      setBgColor(
        $getSelectionStyleValueForProperty(
          selection,
          'background-color',
          '#fff'
        )
      )
      setFontFamily(
        $getSelectionStyleValueForProperty(selection, 'font-family', 'Arial')
      )
    }
  }, [activeEditor])

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
  useEffect(() => {
    return editor.registerCommand(
      INSERT_UNORDERED_LIST_COMMAND,
      (_payload, newEditor) => {
        insertList(editor, 'bullet')
        updateToolbar()
        setActiveEditor(newEditor)
        return true
      },
      COMMAND_PRIORITY_CRITICAL
    )
  }, [editor, updateToolbar])
  const formatHeading = (headingSize: HeadingTagType) => {
    if (blockType !== headingSize) {
      editor.update(() => {
        const selection = $getSelection()
        if (
          $isRangeSelection(selection) ||
          DEPRECATED_$isGridSelection(selection)
        ) {
          $setBlocksType_experimental(selection, () =>
            $createHeadingNode(headingSize)
          )
        }
      })
    }
  }
  function $setBlockBetween(
    selection: RangeSelection | GridSelection,
    createElement: () => ElementNode
  ) {
    if (selection.anchor.key === 'root') {
      const element = createElement()
      const root = $getRoot()
      const firstChild = root.getFirstChild()
      if (firstChild) firstChild.replace(element, true)
      else root.append(element)
      return
    }

    const nodes = selection.getNodes()

    if (selection.anchor.type === 'text') {
      let firstBlock = selection.anchor.getNode().getParent()
      firstBlock = firstBlock?.isInline() ? firstBlock.getParent() : firstBlock
      if (nodes.indexOf(firstBlock) === -1) nodes.push(firstBlock)
    }

    function isBlock(node: LexicalNode) {
      return (
        $isElementNode(node) && !$isRootOrShadowRoot(node) && !node.isInline()
      )
    }

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      if (!isBlock(node)) continue
      const targetElement = createElement()
      targetElement.setFormat(node.getFormatType())
      targetElement.setIndent(node.getIndent())
      const children = node.getChildren()
      targetElement.append(...children)
      node.append(targetElement)
    }
  }
  const formatQuote = () => {
    if (blockType !== 'quote') {
      editor.update(() => {
        const selection = $getSelection()
        if (
          $isRangeSelection(selection) ||
          DEPRECATED_$isGridSelection(selection)
        ) {
          $setBlocksType_experimental(selection, () => {
            // FIXME: this will insert a paragraph
            // even if one was already reparented here
            const paragraph = $createTinaParagraphNode()
            const quote = $createTinaQuoteNode()
            quote.append(paragraph)
            return quote
          })
        }
      })
    }
  }
  const formatCode = () => {
    if (blockType !== 'code') {
      editor.update(() => {
        let selection = $getSelection()

        if (
          $isRangeSelection(selection) ||
          DEPRECATED_$isGridSelection(selection)
        ) {
          if (selection.isCollapsed()) {
            const nodes = selection.getNodes()
            const parent = nodes[0].getParent()
            parent?.append($createCodeNode())
            // $setBlocksType_experimental(selection, () => $createQuoteNode());
            // $setBlocksType_experimental(selection, () => $createCodeNode());
          } else {
            const textContent = selection.getTextContent()
            const codeNode = $createCodeNode()
            selection.insertNodes([codeNode])
            selection = $getSelection()
            if ($isRangeSelection(selection))
              selection.insertRawText(textContent)
          }
        }
      })
    }
  }
  const formatBulletList = () => {
    /**
     * There are a few issues with this code, it's not very consistent
     * when getting updates from the callback that sets the block type
     * and if/when it does work, it only works once. `blockType` seems
     * like it gets stuck on `bullet`... This is all likely due to how
     * paragraph tags are between list items and text
     */
    if (blockType !== 'bullet') {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
    }
  }

  const formatCheckList = () => {
    if (blockType !== 'check') {
      editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined)
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
    }
  }

  const formatNumberedList = () => {
    if (blockType !== 'number') {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
    }
  }

  function sanitizeUrl(url: string): string {
    /** A pattern that matches safe  URLs. */
    const SAFE_URL_PATTERN =
      /^(?:(?:https?|mailto|ftp|tel|file|sms):|[^&:/?#]*(?:[/?#]|$))/gi

    /** A pattern that matches safe data URLs. */
    const DATA_URL_PATTERN =
      /^data:(?:image\/(?:bmp|gif|jpeg|jpg|png|tiff|webp)|video\/(?:mpeg|mp4|ogg|webm)|audio\/(?:mp3|oga|ogg|opus));base64,[a-z0-9+/]+=*$/i

    url = String(url).trim()

    if (url.match(SAFE_URL_PATTERN) || url.match(DATA_URL_PATTERN)) return url

    return 'https://'
  }

  const insertLink = useCallback(() => {
    if (!isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, {
        url: sanitizeUrl('https://'),
        target: '',
      })
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
    }
  }, [editor, isLink])

  const iconEl = {
    heading: <HeadingIcon />,
    link: <LinkIcon />,
    quote: <QuoteIcon />,
    image: <ImageIcon />,
    ul: <UnorderedListIcon />,
    ol: <OrderedListIcon />,
    code: <CodeIcon />,
    codeBlock: <CodeBlockIcon />,
    bold: <BoldIcon />,
    italic: <ItalicIcon />,
    raw: <RawMarkdown />,
  }

  const items: ToolbarItem[] = [
    {
      key: 'elements',
      label: 'Elements',
      icon: <HeadingIcon />,
      children: [
        {
          key: 'heading-1',
          label: (
            <div className="prose">
              <h1>Heading 1</h1>
            </div>
          ),
          onClick: () => formatHeading('h1'),
        },
        {
          key: 'heading-2',
          label: (
            <div className="prose">
              <h2>Heading 2</h2>
            </div>
          ),
          onClick: () => formatHeading('h2'),
        },
        {
          key: 'heading-3',
          label: (
            <div className="prose">
              <h3>Heading 3</h3>
            </div>
          ),
          onClick: () => formatHeading('h3'),
        },
        {
          key: 'heading-4',
          label: (
            <div className="prose">
              <h4>Heading 4</h4>
            </div>
          ),
          onClick: () => formatHeading('h4'),
        },
        {
          key: 'heading-5',
          label: (
            <div className="prose">
              <h5>Heading 5</h5>
            </div>
          ),
          onClick: () => formatHeading('h5'),
        },
        {
          key: 'heading-6',
          label: (
            <div className="prose">
              <h6>Heading 6</h6>
            </div>
          ),
          onClick: () => formatHeading('h6'),
        },
        // {
        //   label: (
        //     <div className="prose">
        //       <p>Paragraph</p>
        //     </div>
        //   ),
        //   onClick: () => formatHeading("h1"),
        // },
      ],
    },
    {
      key: 'link',
      onClick: () => {
        insertLink()
      },
      label: 'Link',
      icon: <LinkIcon />,
    },
    {
      key: 'image',
      onClick: () => {
        console.log('add image')
        // editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
        //   altText: 'Cat typing on a laptop',
        //   src: landscapeImage,
        // })
      },
      label: 'Image',
      icon: <ImageIcon />,
    },
    {
      key: 'blockquote',
      onClick: () => {
        formatQuote()
      },
      label: 'Blockquote',
      icon: <QuoteIcon />,
    },
    {
      onClick: () => {
        formatBulletList()
      },
      key: 'bullet-list',
      label: 'Bullet List',
      icon: <UnorderedListIcon />,
    },
    {
      onClick: () => {
        formatNumberedList()
      },
      key: 'number-list',
      label: 'Number List',
      icon: <OrderedListIcon />,
    },
    {
      key: 'code',
      onClick: () => {
        activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')
      },
      label: 'Code',
      icon: <CodeIcon />,
    },
    {
      key: 'code-block',
      onClick: () => {
        formatCode()
      },
      label: 'Code Block',
      icon: <CodeBlockIcon />,
    },
    {
      key: 'table',
      onClick: () => {
        const meh = activeEditor.dispatchCommand(INSERT_TABLE_COMMAND, {
          columns: '3',
          rows: '2',
        })
      },
      label: 'Table',
      icon: <TableIcon />,
    },
    {
      key: 'bold',
      onClick: () => {
        const meh = activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')
      },
      active: isBold,
      label: 'Bold',
      icon: <BoldIcon />,
    },
    {
      key: 'italic',
      onClick: () => {
        activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')
      },
      label: 'Italic',
      icon: <ItalicIcon />,
    },
    {
      key: 'raw',
      onClick: () => {},
      label: 'Raw',
      icon: <RawMarkdown />,
    },
  ]
  const [itemsShown, setItemsShown] = React.useState(items.length)

  const showEmbed = true
  const EMBED_ICON_WIDTH = 100
  const ICON_WIDTH = 40
  const toolbarRef = React.useRef(null)
  useResize(toolbarRef, (entry) => {
    const width = entry.target.getBoundingClientRect().width
    const itemsShown = (width - (showEmbed ? EMBED_ICON_WIDTH : 0)) / ICON_WIDTH
    setItemsShown(Math.floor(itemsShown))
  })

  return (
    <div
      ref={toolbarRef}
      className="max-w-full w-full border shadow-sm isolate grid rounded-md shadow-sm divide-x"
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(${ICON_WIDTH}px, 1fr))`,
        gridTemplateRows: 'auto',
        gridAutoRows: 0,
      }}
    >
      {items.map((item, index) => {
        if (index > itemsShown) {
          return null
        }
        const isFirst = index === 0
        const isNotFirst = index !== 0
        // const isLast = index + 1 === items.length;
        const isLast = false
        return (
          <ToolbarButton
            isFirst={isFirst}
            isLast={isLast}
            isNotFirst={isNotFirst}
            {...item}
          />
        )
      })}
      <ToolbarButton
        label={''}
        isFirst={false}
        isLast={true}
        isNotFirst={true}
        expand={true}
        align="right"
        icon={<EllipsisIcon title="More" />}
        children={items.slice(itemsShown + 1)}
      />
    </div>
  )
}
export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

const ToolbarButton = (
  props: ToolbarItem & {
    isFirst?: boolean
    isLast?: boolean
    isNotFirst?: boolean
    expand?: boolean
  }
) => {
  const { label, icon, children, isFirst, isLast, isNotFirst } = props
  const className = classNames(
    isFirst ? '' : '',
    isLast ? '' : '',
    // isNotFirst ? "-ml-px" : "",
    isNotFirst ? '' : '',
    props.expand ? 'w-full' : 'flex-1',
    props.expand ? 'w-full' : 'flex-1',
    props.active
      ? 'text-blue-600 hover:bg-gray-100'
      : 'text-gray-700 hover:bg-gray-50',
    // "relative inline-flex h-10 flex justify-center items-center border border-gray-300 bg-white p-1 text-xs font-bold uppercase text-gray-700 hover:bg-gray-50 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
    'focus:outline-none relative inline-flex h-10 flex justify-center items-center bg-white p-1 text-xs font-bold uppercase focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'
  )

  if (children && children?.length > 0) {
    return (
      <DropdownToolbarButton
        {...props}
        children={children}
        className={className}
      />
    )
  }

  return (
    <button type="button" className={className} onClick={props.onClick}>
      {icon || label}
    </button>
  )
}

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

export const useResize = (ref, callback) => {
  React.useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        callback(entry)
      }
    })
    if (ref.current) {
      resizeObserver.observe(ref.current)
    }

    return () => resizeObserver.disconnect()
  }, [ref.current])
}

export function DropdownToolbarButton({
  label,
  icon,
  children,
  isFirst,
  isLast,
  isNotFirst,
  align,
  expand,
  className,
}: ToolbarItem & {
  className: string
  align?: string
  expand?: boolean
  isFirst: boolean
  isLast: boolean
  isNotFirst: boolean
}) {
  return (
    <Menu
      as="div"
      className={`relative inline-block text-center ${expand ? 'w-full' : ''}`}
    >
      <Menu.Button className={classNames(className, 'w-full')}>
        {/* {label} */}
        {icon || label}
        {/* <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" /> */}
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className={`absolute ${
            align === 'right' ? 'right-0' : 'left-0'
          } z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none`}
        >
          <div className="py-1">
            {children.map((child) => {
              return (
                <Menu.Item key={child.key}>
                  {({ active }) => (
                    <button
                      type="button"
                      onClick={child.onClick}
                      className={classNames(
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                        'text-left w-full block px-4 py-2 text-sm'
                      )}
                    >
                      {child.label}
                    </button>
                  )}
                </Menu.Item>
              )
            })}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}
