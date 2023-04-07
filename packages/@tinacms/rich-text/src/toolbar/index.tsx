import React, { useState, useCallback, useEffect } from 'react'
import {
  $getSelection,
  $isRangeSelection,
  $isRootOrShadowRoot,
  TextNode,
  COMMAND_PRIORITY_CRITICAL,
  DEPRECATED_$isGridSelection,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  ElementNode,
  type RangeSelection,
} from 'lexical'
import { INSERT_TABLE_COMMAND } from '@lexical/table'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $createHeadingNode,
  $isHeadingNode,
  type HeadingTagType,
} from '@lexical/rich-text'
import { $findMatchingParent, $getNearestNodeOfType } from '@lexical/utils'
import {
  ListNode,
  insertList,
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from '@lexical/list'
import { $isAtNodeEnd, $setBlocksType } from '@lexical/selection'
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link'
import { $createCodeNode } from '@lexical/code'
import {
  BoldIcon,
  CodeBlockIcon,
  CodeIcon,
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
import { ToolbarComponent } from './component'

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

export const Toolbar = () => {
  const [editor] = useLexicalComposerContext()
  const [activeEditor, setActiveEditor] = useState(editor)
  const [blockType, setBlockType] =
    useState<keyof typeof blockTypeToBlockName>('paragraph')
  const [isLink, setIsLink] = useState(false)
  const [isBold, setIsBold] = useState(false)

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

      // Update links
      const node = getSelectedNode(selection)
      const parent = node.getParent()
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true)
      } else {
        setIsLink(false)
      }

      if (elementDOM !== null) {
        const parentList = $getNearestNodeOfType<ListNode>(anchorNode, ListNode)
        const type = parentList
          ? parentList.getListType()
          : $isHeadingNode(element)
          ? element.getTag()
          : element.getType()
        if (type in blockTypeToBlockName) {
          setBlockType(type as keyof typeof blockTypeToBlockName)
        }
      }
      // Handle buttons
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
          $setBlocksType(selection, () => $createHeadingNode(headingSize))
        }
      })
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
          $setBlocksType(selection, () => {
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
            const parent = nodes[0]?.getParent()
            parent?.append($createCodeNode())
            // $setBlocksType(selection, () => $createQuoteNode());
            // $setBlocksType(selection, () => $createCodeNode());
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

  return <ToolbarComponent items={items} />
}
