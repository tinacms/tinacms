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

// @ts-nocheck
import React from 'react'

export type Components = {
  [key: string]: (props: unknown) => JSX.Element
}

export const TinaMarkdown = ({
  content,
  components = {},
}: {
  content: SlateNodeType[] | { type: 'root'; children: SlateNodeType[] }
  components?: { [key: string]: (props: object) => JSX.Element }
}) => {
  if (!content) {
    return null
  }
  const nodes = Array.isArray(content) ? content : content.children
  return (
    <>
      {nodes.map((child) => {
        const { children, ...props } = child
        switch (child.type) {
          case 'h1':
          case 'h2':
          case 'h3':
          case 'h4':
          case 'h5':
          case 'h6':
          case 'p':
          case 'blockquote':
          case 'ol':
          case 'ul':
            if (components[child.type]) {
              const Component = components[child.type]
              return (
                <Component {...props} childrenRaw={children}>
                  <TinaMarkdown components={components} content={children} />
                </Component>
              )
            }
            return React.createElement(child.type, {
              children: (
                <TinaMarkdown components={components} content={children} />
              ),
            })
          case 'li':
            if (components[child.type]) {
              const Component = components[child.type]
              return (
                <Component {...props} childrenRaw={content}>
                  <TinaMarkdown components={components} content={children} />
                </Component>
              )
            }
            return (
              <li>
                <TinaMarkdown components={components} content={children} />
              </li>
            )
          case 'lic':
            return (
              <div>
                <TinaMarkdown
                  components={components}
                  content={child.children}
                />
              </div>
            )
          case 'img':
            if (components[child.type]) {
              const Component = components[child.type]
              return <Component {...props} />
            }
            return <img src={child.url} alt={child.caption} />
          case 'a':
            if (components[child.type]) {
              const Component = components[child.type]
              return (
                <Component {...props} childrenRaw={content}>
                  <TinaMarkdown components={components} content={children} />
                </Component>
              )
            }
            return (
              <a href={child.url}>
                <TinaMarkdown components={components} content={children} />
              </a>
            )
          case 'code_block':
            const value = child.children
              .map((item) => {
                // I don't think it's possible to have more than one
                // child item here
                return item.children[0].text
              })
              .join('\n')
            if (components[child.type]) {
              const Component = components[child.type]
              return (
                <Component {...props} childrenRaw={children}>
                  {value}
                </Component>
              )
            }
            return (
              <pre>
                <code>{value}</code>
              </pre>
            )
          case 'thematic_break':
            if (components[child.type]) {
              const Component = components[child.type]
              return <Component {...props} />
            }
            return <hr />
          case 'text':
            return <Leaf components={components} {...child} />
          case 'mdxJsxTextElement':
          case 'mdxJsxFlowElement':
            const Component = components[child.name]
            if (Component) {
              const props = child.props ? child.props : {}
              return <Component {...props} />
            } else {
              if (!child.name) {
                throw new Error(`Fragments are not yet supported`)
              }
              throw new Error(`No component provided for ${child.name}`)
            }
          default:
            if (typeof child.text === 'string') {
              return <Leaf components={components} {...child} />
            }

            console.log(`No tina renderer for ${child.type}`, child)
        }
      })}
    </>
  )
}

const Leaf = (props: {
  type: 'text'
  text: string
  bold: boolean
  italic: boolean
  underline: boolean
  strikethrough: boolean
  code: boolean
  components: { [key: string]: JSX.Element }[]
}) => {
  if (props.bold) {
    const { bold, ...rest } = props
    if (props.components.bold) {
      const Component = props.components.bold
      return (
        <Component>
          <Leaf {...rest} />
        </Component>
      )
    }
    return (
      <strong>
        <Leaf {...rest} />
      </strong>
    )
  }
  if (props.italic) {
    const { italic, ...rest } = props
    if (props.components.italic) {
      const Component = props.components.italic
      return (
        <Component>
          <Leaf {...rest} />
        </Component>
      )
    }
    return (
      <em>
        <Leaf {...rest} />
      </em>
    )
  }
  if (props.underline) {
    const { underline, ...rest } = props
    if (props.components.underline) {
      const Component = props.components.underline
      return (
        <Component>
          <Leaf {...rest} />
        </Component>
      )
    }
    return (
      <u>
        <Leaf {...rest} />
      </u>
    )
  }
  if (props.strikethrough) {
    const { strikethrough, ...rest } = props
    if (props.components.strikethrough) {
      const Component = props.components.strikethrough
      return (
        <Component>
          <Leaf {...rest} />
        </Component>
      )
    }
    return (
      <s>
        <Leaf {...rest} />
      </s>
    )
  }
  if (props.code) {
    const { code, ...rest } = props
    if (props.components.code) {
      const Component = props.components.code
      return (
        <Component>
          <Leaf {...rest} />
        </Component>
      )
    }
    return (
      <code>
        <Leaf {...rest} />
      </code>
    )
  }
  return <>{props.text}</>
}

export type SlateNodeType =
  | {
      type: 'heading_one'
      children: SlateNodeType[]
    }
  | {
      type: 'heading_two'
      children: SlateNodeType[]
    }
  | {
      type: 'heading_three'
      children: SlateNodeType[]
    }
  | {
      type: 'heading_four'
      children: SlateNodeType[]
    }
  | {
      type: 'heading_five'
      children: SlateNodeType[]
    }
  | {
      type: 'heading_six'
      children: SlateNodeType[]
    }
  | {
      type: 'paragraph'
      children: SlateNodeType[]
    }
  | {
      children: SlateNodeType[]
      link: string
      type: 'link'
    }
  | {
      type: 'block_quote'
      children: SlateNodeType[]
    }
  | {
      type: 'text'
      bold?: boolean
      italic?: boolean
      text: string
    }
  | {
      type: 'mdxJsxTextElement'
      props: object
      children: SlateNodeType[]
      name: string
    }
  | {
      type: 'mdxJsxFlowElement'
      props: object
      children: SlateNodeType[]
      name: string
    }
  | {
      type: 'block_quote'
      children: SlateNodeType[]
    }
  | {
      type: 'code_block'
      language: string
      children: SlateNodeType[]
    }
  | {
      type: 'image'
      link: string
      caption: string
    }
  | {
      type: 'thematic_break'
    }
