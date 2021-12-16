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
  useEditorRef,
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
      ? [
          ...props.input.value.children?.map(normalize),
          { type: 'p', children: [{ type: 'text', text: '' }] },
        ]
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
    if (node.children.length > 0) {
      return {
        ...node,
        children: node.children.map(normalize),
      }
    } else {
      return {
        ...node,
        children: [{ type: 'text', text: '' }],
      }
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

  p {
    font-size: 16px;
    line-height: 26px;
    font-weight: normal;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-weight: 600;
    text-transform: none;
    padding: 0;
    margin-bottom: 16px;
  }

  h1 {
    font-size: 32px;
    line-height: 48px;
    margin-top: 0;
    &:not(:first-child) {
      margin-top: 32px;
    }
  }

  h2,
  h3,
  h4,
  h5,
  h6 {
    &:not(:first-child) {
      margin-top: 21px;
    }
  }

  h2 {
    font-size: 28px;
    line-height: 38px;
    margin-top: 0;
  }

  h3 {
    font-size: 24px;
    line-height: 30px;
    margin-top: 0;
  }

  h4 {
    font-size: 21px;
    line-height: 28px;
    margin-top: 0;
  }

  h5 {
    font-size: 18px;
    line-height: 24px;
    margin-top: 0;
  }

  h6 {
    font-size: 16px;
    line-height: 20px;
    margin-top: 0;
  }

  a {
    color: #0084ff;
    border: 0;
    font-weight: normal;
    text-decoration: underline;
  }

  small {
    font-size: 0.707em;
  }

  ul,
  ol {
    margin: 0;
    padding: 0;
  }

  ol li {
    /* prevent 2-digits numbers from being cut-off */
    margin-left: 5px;
    margin-right: 5px;
  }

  ul {
    margin-left: 1.5em;
    margin-bottom: 16px;
    list-style-type: disc;
    list-style-position: outside;
    list-style-image: none;
  }

  ol {
    margin-left: 1.25em;
    margin-bottom: 16px;
    list-style-type: decimal;
  }

  li {
    list-style: inherit;
    ol,
    ul {
      margin-bottom: 0;
    }
  }

  pre {
    padding: 0;
    margin: 0;
  }

  pre > code {
    display: block;
    padding: 0.15em 0.6em;
  }

  img {
    max-width: 100%;
    border: 0;
    padding: 0;
    margin-bottom: 16px;
  }

  blockquote {
    margin: 0 0 16px 0;
    padding-left: 15px;
  }
`
