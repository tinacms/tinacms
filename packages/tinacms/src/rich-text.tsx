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
  if (!nodes) {
    console.log(`Expected to find structured content for TinaMarkdown`)
    return null
  }
  return (
    <>
      {nodes.map((child, index) => {
        // FIXME: Should add positional meta data to each node
        // for use as a key. Though using `index` doesn't seem to present problems
        const key = index
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
                <Component key={key} {...props} childrenRaw={children}>
                  <TinaMarkdown components={components} content={children} />
                </Component>
              )
            }
            return React.createElement(child.type, {
              key,
              children: (
                <TinaMarkdown components={components} content={children} />
              ),
            })
          case 'lic': // List Item Content
            return (
              <div key={key}>
                <TinaMarkdown
                  components={components}
                  content={child.children}
                />
              </div>
            )
          case 'img':
            if (components[child.type]) {
              const Component = components[child.type]
              // @ts-ignore FIXME: TinaMarkdownContent needs to be a union of all possible node types
              return <Component key={key} {...props} />
            }
            // @ts-ignore FIXME: TinaMarkdownContent needs to be a union of all possible node types
            return <img key={key} src={child.url} alt={child.caption} />
          case 'a':
            if (components[child.type]) {
              const Component = components[child.type]
              return (
                // @ts-ignore FIXME: TinaMarkdownContent needs to be a union of all possible node types
                <Component key={key} {...props}>
                  <TinaMarkdown components={components} content={children} />
                </Component>
              )
            }
            return (
              // @ts-ignore FIXME: TinaMarkdownContent needs to be a union of all possible node types
              <a key={key} href={child.url}>
                <TinaMarkdown components={components} content={children} />
              </a>
            )
          case 'code_block':
            const value = child.children
              .map((item) => {
                // I don't think it's possible to have more than one
                // child item here
                // @ts-ignore FIXME: TinaMarkdownContent needs to be a union of all possible node types
                return item.children[0].text
              })
              .join('\n')
            if (components[child.type]) {
              const Component = components[child.type]
              return (
                // @ts-ignore FIXME: TinaMarkdownContent needs to be a union of all possible node types
                <Component key={key} {...props} childrenRaw={children}>
                  {/* @ts-ignore FIXME: TinaMarkdownContent needs to be a union of all possible node types */}
                  {value}
                </Component>
              )
            }
            return (
              <pre key={key}>
                <code>{value}</code>
              </pre>
            )
          case 'hr':
            if (components[child.type]) {
              const Component = components[child.type]
              // @ts-ignore FIXME: TinaMarkdownContent needs to be a union of all possible node types
              return <Component key={key} {...props} />
            }
            return <hr />
          case 'text':
            // @ts-ignore FIXME: TinaMarkdownContent needs to be a union of all possible node types
            return <Leaf key={key} components={components} {...child} />
          case 'mdxJsxTextElement':
          case 'mdxJsxFlowElement':
            // @ts-ignore FIXME: TinaMarkdownContent needs to be a union of all possible node types
            const Component = components[child.name]
            if (Component) {
              // @ts-ignore FIXME: TinaMarkdownContent needs to be a union of all possible node types
              const props = child.props ? child.props : {}
              return <Component key={key} {...props} />
            } else {
              const ComponentMissing = components['component_missing']
              if (ComponentMissing) {
                // @ts-ignore FIXME: TinaMarkdownContent needs to be a union of all possible node types
                return <ComponentMissing key={key} name={child.name} />
              } else {
                // @ts-ignore FIXME: TinaMarkdownContent needs to be a union of all possible node types
                throw new Error(`No component provided for ${child.name}`)
              }
            }
          default:
            // @ts-ignore FIXME: TinaMarkdownContent needs to be a union of all possible node types
            if (typeof child.text === 'string') {
              // @ts-ignore FIXME: TinaMarkdownContent needs to be a union of all possible node types
              return <Leaf key={key} components={components} {...child} />
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
