// @ts-nocheck
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
import { Form } from '../../../forms'
import { MdxField, PopupAdder } from './field'
import {
  Range,
  Point,
  Element as SlateElement,
  Editor,
  createEditor,
  Transforms,
  BaseRange,
  Element,
} from 'slate'
import {
  useSelected,
  useFocused,
  Slate,
  Editable,
  withReact,
  ReactEditor,
} from 'slate-react'
import type { BaseEditor } from 'slate'
import type { RenderLeafProps, RenderElementProps } from 'slate-react'
import type { SlateNodeType } from './types'

// https://docs.slatejs.org/concepts/12-typescript#defining-editor-element-and-text-types
// type CustomElement = { type: "paragraph"; children: CustomText[] };
// type CustomText = { text: string; bold?: true };
// declare module 'slate' {
//   interface CustomTypes {
//     Editor: BaseEditor & ReactEditor
//     Element: SlateNodeType
//     // Text: CustomText;
//   }
// }

export const RichEditor = (props) => {
  // Hot reloads when usign useMemo to initialize https://github.com/ianstormtaylor/slate/issues/4081
  const [editor] = React.useState(
    withShortcuts(withReact(createEditor()))
  ) as (BaseEditor & ReactEditor)[]
  const [value, setValue] = React.useState(
    props.input.value.children
      ? [
          ...props.input.value.children?.map(normalize),
          // { type: 'paragraph', children: [{ type: 'text', text: '' }] },
        ]
      : [{ type: 'paragraph', children: [{ type: 'text', text: '' }] }]
  )
  const [voidSelection, setVoidSelectionInner] = React.useState<BaseRange>(null)
  const setVoidSelection = (selection: BaseRange) => {
    setVoidSelectionInner(selection)
  }
  const templates = props.field.templates

  React.useEffect(() => {
    props.input.onChange({ type: 'root', children: value })
  }, [JSON.stringify(value)])

  const renderLeaf = React.useCallback(
    ({ leaf, attributes, children }: RenderLeafProps) => {
      if (leaf.bold) {
        children = <strong>{children}</strong>
      }

      if (leaf.code) {
        children = <code>{children}</code>
      }

      if (leaf.italic) {
        children = <em>{children}</em>
      }

      if (leaf.underline) {
        children = <u>{children}</u>
      }

      return <span {...attributes}>{children}</span>
    },
    []
  )

  const renderElement = React.useCallback(
    (props: RenderElementProps) => {
      const element = props.element
      switch (element.type) {
        case 'heading_one':
          return <h1 {...props.attributes}>{props.children}</h1>
        case 'heading_two':
          return <h2 {...props.attributes}>{props.children}</h2>
        case 'heading_three':
          return <h3 {...props.attributes}>{props.children}</h3>
        case 'heading_four':
          return <h4 {...props.attributes}>{props.children}</h4>
        case 'heading_five':
          return <h5 {...props.attributes}>{props.children}</h5>
        case 'heading_six':
          return <h6 {...props.attributes}>{props.children}</h6>
        case 'paragraph':
          return <p {...props.attributes}>{props.children}</p>
        case 'thematic_break':
          return <hr {...props.attributes} />
        case 'image':
          return <img src={element.link} alt={element.caption} />
        case 'code_block':
          return (
            <pre {...props.attributes}>
              <code>{props.children}</code>
            </pre>
          )
        case 'block_quote':
          return (
            <blockquote
              style={{ borderLeft: '2px solid #eee', paddingLeft: '8px' }}
              {...props.attributes}
            >
              {props.children}
            </blockquote>
          )
        case 'link':
          return (
            <a
              style={{ textDecoration: 'underline' }}
              {...props.attributes}
              href={element.link}
            >
              {props.children}
            </a>
          )
        case 'mdxJsxTextElement':
          return (
            <MdxPicker
              inline={true}
              {...props}
              templates={templates}
              isReady={!!voidSelection}
              voidSelection={voidSelection}
              onChange={(value, selection) => {
                const newProperties: Partial<Element> = {
                  props: value,
                }
                Transforms.setNodes(editor, newProperties, {
                  /**
                   * match traverses the ancestors of the relevant node
                   * so matching on type works for this, but likely won't work
                   * on more complex nested mdxJsxTextElement nodes. I think
                   * we'll want to match the path to the selection path, but
                   * they're off by one:
                   * selection.focus.path => [0, 1, 0]
                   * and path is [0, 1]. I believe that's because the last
                   * 0 in the focus.path array is referring to the text node
                   */
                  match: (node, path) => {
                    // console.log(selection.focus);
                    // console.log(path, node.type);
                    if (node.type === 'mdxJsxTextElement') {
                      return true
                    }
                    return false
                  },
                  at: selection,
                })
              }}
            />
          )
        case 'mdxJsxFlowElement':
          return (
            <MdxPicker
              {...props}
              inline={false}
              templates={templates}
              isReady={!!voidSelection}
              voidSelection={voidSelection}
              onChange={(value, selection) => {
                const newProperties: Partial<Element> = {
                  props: value,
                }
                Transforms.setNodes(editor, newProperties, {
                  at: selection,
                })
              }}
            />
          )
        default:
          console.log(`no slate renderer for ${element.type}`, element)
          return <p {...props.attributes}>{props.children}</p>
      }
    },
    [JSON.stringify(voidSelection)]
  )

  editor.isVoid = (element) => {
    switch (element.type) {
      case 'mdxJsxFlowElement':
      case 'mdxJsxTextElement':
      case 'image':
        return true
      default:
        return false
    }
  }
  editor.isInline = (element) => {
    switch (element.type) {
      case 'link':
      case 'mdxJsxTextElement':
        return true
      default:
        return false
    }
  }

  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '35px',
        }}
      >
        <label
          style={{ fontWeight: 600, fontSize: '13px', marginBottom: '6px' }}
        >
          {props.field.label}
        </label>
        <PopupAdder
          showButton={true}
          onAdd={(template) => {
            Transforms.insertNodes(editor, [
              {
                type: template.inline
                  ? 'mdxJsxTextElement'
                  : 'mdxJsxFlowElement',
                name: template.name,
                props: template.defaultItem,
                ordered: false,
                children: [
                  {
                    type: 'text',
                    text: '',
                  },
                ],
              },
              // { type: 'paragraph', children: [{ type: 'text', text: '' }] },
            ])
          }}
          templates={templates}
        />
      </div>

      <div
        style={{
          padding: '10px',
          marginBottom: '18px',
          background: 'white',
          borderRadius: '4px',
          border: '1px solid #efefef',
        }}
        className="slate-tina-field"
      >
        <style>{`.slate-tina-field [data-slate-node] {margin-bottom: 16px;}`}</style>
        <Slate
          editor={editor}
          value={value}
          onChange={(newValue) => {
            if (editor.selection) {
              setVoidSelection(editor.selection)
            }
            setValue(newValue)
          }}
        >
          <Editable renderLeaf={renderLeaf} renderElement={renderElement} />
        </Slate>
      </div>
    </>
  )
}

export const MdxPicker = (props) => {
  const isFocused = useFocused()
  const isSelected = useSelected()
  const initialValues = props.element.props
  const activeTemplate = props.templates.find(
    (template) => template.name === props.element.name
  )
  const id = props.element.name + Math.floor(Math.random() * 100)
  const form = React.useMemo(() => {
    return new Form({
      id,
      label: id,
      initialValues,
      onChange: ({ values }) => {
        props.onChange(values, props.voidSelection)
      },
      onSubmit: () => {},
      fields: activeTemplate ? activeTemplate.fields : [],
    })
  }, [JSON.stringify(props.voidSelection)])

  return (
    <div
      {...props.attributes}
      style={{
        display: props.inline ? 'inline-block' : 'block',
        boxShadow: isSelected && isFocused ? '0 0 0 3px #B4D5FF' : 'none',
      }}
    >
      <div contentEditable={false}>
        <MdxField
          inline={props.inline}
          tinaForm={form}
          field={activeTemplate}
        />
      </div>
      {props.children}
    </div>
  )
}

const normalize = (node: SlateNodeType) => {
  if (['mdxJsxFlowElement', 'mdxJsxTextElement', 'image'].includes(node.type)) {
    return {
      ...node,
      children: [{ type: 'text', text: '' }],
    }
  }
  if (node.children) {
    return {
      ...node,
      children: node.children.map(normalize),
    }
  }
  return node
}

const SHORTCUTS = {
  '*': 'list-item',
  '-': 'list-item',
  '+': 'list-item',
  '>': 'block_quote',
  '#': 'heading_one',
  '##': 'heading_two',
  '###': 'heading_three',
  '####': 'heading_four',
  '#####': 'heading_five',
  '######': 'heading_six',
}

const withShortcuts = (editor) => {
  const { deleteBackward, insertText } = editor

  editor.insertText = (text) => {
    const { selection } = editor

    if (text === ' ' && selection && Range.isCollapsed(selection)) {
      const { anchor } = selection
      const block = Editor.above(editor, {
        match: (n) => Editor.isBlock(editor, n),
      })
      const path = block ? block[1] : []
      const start = Editor.start(editor, path)
      const range = { anchor, focus: start }
      const beforeText = Editor.string(editor, range)
      const type = SHORTCUTS[beforeText]

      if (type) {
        Transforms.select(editor, range)
        Transforms.delete(editor)
        const newProperties: Partial<SlateElement> = {
          type,
        }
        Transforms.setNodes(editor, newProperties, {
          match: (n) => Editor.isBlock(editor, n),
        })

        if (type === 'list-item') {
          const list: BulletedListElement = {
            type: 'bulleted-list',
            children: [],
          }
          Transforms.wrapNodes(editor, list, {
            match: (n) =>
              !Editor.isEditor(n) &&
              SlateElement.isElement(n) &&
              n.type === 'list-item',
          })
        }

        return
      }
    }

    insertText(text)
  }

  editor.deleteBackward = (...args) => {
    const { selection } = editor

    if (selection && Range.isCollapsed(selection)) {
      const match = Editor.above(editor, {
        match: (n) => Editor.isBlock(editor, n),
      })

      if (match) {
        const [block, path] = match
        const start = Editor.start(editor, path)

        if (
          !Editor.isEditor(block) &&
          SlateElement.isElement(block) &&
          block.type !== 'paragraph' &&
          Point.equals(selection.anchor, start)
        ) {
          const newProperties: Partial<SlateElement> = {
            type: 'paragraph',
          }
          Transforms.setNodes(editor, newProperties)

          if (block.type === 'list-item') {
            Transforms.unwrapNodes(editor, {
              match: (n) =>
                !Editor.isEditor(n) &&
                SlateElement.isElement(n) &&
                n.type === 'bulleted-list',
              split: true,
            })
          }

          return
        }
      }

      deleteBackward(...args)
    }
  }

  return editor
}
