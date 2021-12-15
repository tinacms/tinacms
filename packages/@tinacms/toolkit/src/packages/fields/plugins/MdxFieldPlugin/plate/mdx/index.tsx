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

import {
  getPlatePluginTypes,
  PlatePlugin,
  getRenderElement,
} from '@udecode/plate'
import React from 'react'
import { Transforms } from 'slate'
import { usePlateEditorRef } from '@udecode/plate'
import { useSelected, useFocused, ReactEditor } from 'slate-react'
import { MdxField } from './field'
import { Form } from '../../../../../forms'
import styled from 'styled-components'

export const MdxElement = (props) => {
  const editor = usePlateEditorRef(props.name)
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
        const isInline = props.element.type === 'mdxJsxTextElement'
        if (isInline) {
          const newProperties = {
            props: values,
          }
          // @ts-ignore BaseEditor fix
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
            match: (node) => {
              // @ts-ignore BaseEditor fix
              if (node.type === 'mdxJsxTextElement') {
                return true
              }
              return false
            },
            // @ts-ignore Argument of type 'SPEditor' is not assignable to parameter of type 'ReactEditor'
            at: ReactEditor.findPath(editor, props.element),
          })
        } else {
          const newProperties = {
            props: values,
          }

          // @ts-ignore BaseEditor fix
          Transforms.setNodes(editor, newProperties, {
            // ts-ignore Argument of type 'SPEditor' is not assignable to parameter of type 'ReactEditor'
            at: ReactEditor.findPath(editor, props.element),
          })
        }
      },
      onSubmit: () => {},
      fields: activeTemplate ? activeTemplate.fields : [],
    })
  }, [])

  return (
    <Wrapper
      as={props.inline ? 'span' : 'div'}
      {...props.attributes}
      style={{
        // display: props.inline ? 'inline-block' : 'block',
        boxShadow: isSelected && isFocused ? '0 0 0 3px #B4D5FF' : 'none',
      }}
    >
      <Wrapper
        as={props.inline ? 'span' : 'div'}
        style={{
          userSelect: 'none',
        }}
        contentEditable={false}
      >
        <MdxField
          inline={props.inline}
          tinaForm={form}
          field={activeTemplate}
        />
      </Wrapper>
      {props.children}
    </Wrapper>
  )
}

const Wrapper = styled.div``

export const createMDXPlugin = (): PlatePlugin => ({
  pluginKeys: 'mdxJsxFlowElement',
  voidTypes: getPlatePluginTypes('mdxJsxFlowElement'),
  renderElement: getRenderElement('mdxJsxFlowElement'),
})

export const createMDXTextPlugin = (): PlatePlugin => ({
  pluginKeys: 'mdxJsxTextElement',
  voidTypes: getPlatePluginTypes('mdxJsxTextElement'),
  inlineTypes: getPlatePluginTypes('mdxJsxTextElement'),
  renderElement: getRenderElement('mdxJsxTextElement'),
})
