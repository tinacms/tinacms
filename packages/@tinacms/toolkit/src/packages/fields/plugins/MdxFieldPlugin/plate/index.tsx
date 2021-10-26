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
import styled from 'styled-components'
import {
  Plate,
  createReactPlugin,
  createHistoryPlugin,
  createParagraphPlugin,
  createBlockquotePlugin,
  createCodeBlockPlugin,
  createHeadingPlugin,
  createBoldPlugin,
  createItalicPlugin,
  createUnderlinePlugin,
  createStrikethroughPlugin,
  createCodePlugin,
  createPlateComponents,
  createIndentPlugin,
  createNormalizeTypesPlugin,
  createPlateOptions,
  createLinkPlugin,
  createImagePlugin,
  createBasicMarkPlugins,
  createListPlugin,
  createAutoformatPlugin,
  createResetNodePlugin,
  createTrailingBlockPlugin,
  createHorizontalRulePlugin,
  createSelectOnBackspacePlugin,
  createSoftBreakPlugin,
  createExitBreakPlugin,
} from '@udecode/plate'
import { wrapFieldsWithMeta } from '../../wrapFieldWithMeta'

import { CONFIG } from './config'
import { ToolbarButtons } from './toolbar'
import { createTinaImagePlugin, Img } from './image'
import { createMDXPlugin, createMDXTextPlugin, MdxElement } from './mdx'

import { InputProps, InputCss } from '../../../components'

const options = createPlateOptions()

export const RichEditor = wrapFieldsWithMeta<
  InputProps,
  { templates: unknown[] }
>((props) => {
  const [value, setValue] = React.useState(
    props.input.value.children
      ? [...props.input.value.children?.map(normalize)]
      : // Empty values need at least one item
        [{ type: 'p', children: [{ type: 'text', text: '' }] }]
  )

  const templates = props.field.templates
  const name = props.input.name

  React.useEffect(() => {
    props.input.onChange({ type: 'root', children: value })
  }, [JSON.stringify(value)])

  const components = createPlateComponents({
    img: (props) => <Img {...props} name={name} />,
    mdxJsxTextElement: (props) => {
      return <MdxElement {...props} templates={templates} inline={true} />
    },
    mdxJsxFlowElement: (props) => {
      return <MdxElement {...props} templates={templates} inline={false} />
    },
  })

  const pluginsBasic = [
    createTinaImagePlugin(),
    createMDXPlugin(),
    createMDXTextPlugin(),
    createReactPlugin(),
    createHistoryPlugin(),
    createHorizontalRulePlugin(),
    createParagraphPlugin(),
    createBlockquotePlugin(),
    createCodeBlockPlugin(),
    createHeadingPlugin(),
    createLinkPlugin(),
    createListPlugin(),
    createImagePlugin(),
    createBoldPlugin(),
    createItalicPlugin(),
    createUnderlinePlugin(),
    createStrikethroughPlugin(),
    createCodePlugin(),
    ...createBasicMarkPlugins(),
    createIndentPlugin(CONFIG.indent),
    createAutoformatPlugin(CONFIG.autoformat),
    createResetNodePlugin(CONFIG.resetBlockType),
    createSoftBreakPlugin(CONFIG.softBreak),
    createExitBreakPlugin(CONFIG.exitBreak),
    createNormalizeTypesPlugin(CONFIG.forceLayout),
    createTrailingBlockPlugin(CONFIG.trailingBlock),
    createSelectOnBackspacePlugin(CONFIG.selectOnBackspace),
  ]
  return (
    <>
      <ToolbarButtons name={props.input.name} templates={templates} />
      <PlateWrapper>
        <Plate
          id={props.input.name}
          initialValue={value}
          plugins={pluginsBasic}
          components={components}
          options={options}
          onChange={(value) => {
            setValue(value)
          }}
        />
      </PlateWrapper>
    </>
  )
})

const normalize = (node: any) => {
  if (['mdxJsxFlowElement', 'mdxJsxTextElement', 'img'].includes(node.type)) {
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

const PlateWrapper = styled.div`
  ${InputCss};
  overflow-x: hidden;
  overflow-y: auto;
  min-height: 200px;
  overflow-y: auto;
  display: block;
`
