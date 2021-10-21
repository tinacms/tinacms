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

// @ts-ocheck
import React from 'react'

type BaseComponents = {
  h1?: { children: JSX.Element }
  h2?: { children: JSX.Element }
  h3?: { children: JSX.Element }
  h4?: { children: JSX.Element }
  h5?: { children: JSX.Element }
  h6?: { children: JSX.Element }
  p?: { children: JSX.Element }
  a?: { url: string; children: JSX.Element }
  italic?: { children: JSX.Element }
  bold?: { children: JSX.Element }
  strikethrough?: { children: JSX.Element }
  underline?: { children: JSX.Element }
  code?: { children: JSX.Element }
  ul?: { children: JSX.Element }
  ol?: { children: JSX.Element }
  block_quote?: { children: JSX.Element }
  code_block?: { language?: string; children: JSX.Element }
  img?: { url: string; caption?: string; alt?: string }
  hr?: {}
  // Provide a fallback when a JSX component wasn't provided
  component_missing?: { name: string }
}

type BaseComponentSignature = {
  [BK in keyof BaseComponents]: (props: BaseComponents[BK]) => JSX.Element
}

/**
 * Define the allowed components and their props
 * ```ts
 * const components:
 * Components<{
 *  BlockQuote: {
 *      children: TinaMarkdownContent;
 *      authorName: string;
 *    };
 *  }> = {
 *    BlockQuote: (props: {
 *      children: TinaMarkdownContent;
 *      authorName: string;
 *    }) => {
 *      return (
 *        <div>
 *          <blockquote>
 *            <TinaMarkdown content={props.children} />
 *            {props.authorName}
 *          </blockquote>
 *        </div>
 *      );
 *    }
 *  }
 * }
 * ```
 */
export type Components<ComponentAndProps extends object> = {
  [K in keyof ComponentAndProps]: (props: ComponentAndProps[K]) => JSX.Element
} & BaseComponentSignature

export type TinaMarkdownContent = {
  type: string
  children: TinaMarkdownContent[]
}

export const TinaMarkdown = ({
  content,
  components = {},
}: {
  content: TinaMarkdownContent | TinaMarkdownContent[]
  // FIXME: {} should be passed in
  components?: Components<{}>
}) => {
  if (!content) {
    return null
  }
  const nodes = Array.isArray(content) ? content : content.children
  return (
    <>
      {nodes.map((child) => {
        // console.log(JSON.stringify(child))
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
          case 'li':
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
          case 'lic': // List Item Content
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
                <Component {...props}>
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
          case 'hr':
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
              const ComponentMissing = components['component_missing']
              if (ComponentMissing) {
                return <ComponentMissing name={child.name} />
              } else {
                throw new Error(`No component provided for ${child.name}`)
              }
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
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strikethrough?: boolean
  code?: boolean
  components: Pick<
    BaseComponentSignature,
    'bold' | 'italic' | 'underline' | 'strikethrough' | 'code'
  >
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
