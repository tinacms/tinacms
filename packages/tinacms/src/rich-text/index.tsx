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
  code_block?: { lang?: string; children: JSX.Element }
  img?: { url: string; caption?: string; alt?: string }
  hr?: {}
  break?: {}
  maybe_mdx?: { children: JSX.Element }
  html?: { value: string }
  html_inline?: { value: string }
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
    return null
  }
  return (
    <>
      {nodes.map((child, index) => {
        return <MemoNode components={components} key={index} child={child} />
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

// FIXME: this needs more testing. But in theory all props
// are serializable anyway so the JSON.stringify comparison makes sense.
// I haven't thought all the way through this though, and maybe it'll break
// down with custom components in some way.
// In general this component handles most things without too many issues but for
// large bodies of text it becomes pretty painful to see as-you-type updates, especially
// in Safari.
const MemoNode = (props) => {
  const MNode = React.useMemo(
    () => <Node {...props} />,
    [JSON.stringify(props)]
  )
  return MNode
}
const Node = ({ components, child }) => {
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
          <Component {...props}>
            <TinaMarkdown components={components} content={children} />
          </Component>
        )
      }
      return React.createElement(child.type, {
        children: <TinaMarkdown components={components} content={children} />,
      })
    case 'lic': // List Item Content
      return (
        <div>
          <TinaMarkdown components={components} content={child.children} />
        </div>
      )
    case 'img':
      if (components[child.type]) {
        const Component = components[child.type]
        // @ts-ignore FIXME: TinaMarkdownContent needs to be a union of all possible node types
        return <Component {...props} />
      }
      // @ts-ignore FIXME: TinaMarkdownContent needs to be a union of all possible node types
      return <img src={child.url} alt={child.caption} />
    case 'a':
      if (components[child.type]) {
        const Component = components[child.type]
        return (
          // @ts-ignore FIXME: TinaMarkdownContent needs to be a union of all possible node types
          <Component {...props}>
            <TinaMarkdown components={components} content={children} />
          </Component>
        )
      }
      return (
        // @ts-ignore FIXME: TinaMarkdownContent needs to be a union of all possible node types
        <a href={child.url}>
          <TinaMarkdown components={components} content={children} />
        </a>
      )
    case 'code_block':
      const value = child.value
      if (components[child.type]) {
        const Component = components[child.type]
        return (
          // @ts-ignore FIXME: TinaMarkdownContent needs to be a union of all possible node types
          <Component {...props}>
            {/* @ts-ignore FIXME: TinaMarkdownContent needs to be a union of all possible node types */}
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
        // @ts-ignore FIXME: TinaMarkdownContent needs to be a union of all possible node types
        return <Component {...props} />
      }
      return <hr />
    case 'break':
      if (components[child.type]) {
        const Component = components[child.type]
        return <Component {...props} />
      }
      return <br />
    case 'text':
      // @ts-ignore FIXME: TinaMarkdownContent needs to be a union of all possible node types
      return <Leaf components={components} {...child} />
    case 'mdxJsxTextElement':
    case 'mdxJsxFlowElement':
      // @ts-ignore FIXME: TinaMarkdownContent needs to be a union of all possible node types
      const Component = components[child.name]
      if (Component) {
        // @ts-ignore FIXME: TinaMarkdownContent needs to be a union of all possible node types
        const props = child.props ? child.props : {}
        return <Component {...props} />
      } else {
        const ComponentMissing = components['component_missing']
        if (ComponentMissing) {
          // @ts-ignore FIXME: TinaMarkdownContent needs to be a union of all possible node types
          return <ComponentMissing name={child.name} />
        } else {
          return <span>{`No component provided for ${child.name}`}</span>
        }
      }
    case 'maybe_mdx':
      /**
       * We don't want to render this as it's only displayed while editing an mdx node and should
       * be transformed before form submission
       */
      return null
    case 'html':
    case 'html_inline':
      if (components[child.type]) {
        const Component = components[child.type]
        return <Component {...props} />
      }
      return child.value
    case 'invalid_markdown':
      return <pre>{child.value}</pre>
    default:
      // @ts-ignore FIXME: TinaMarkdownContent needs to be a union of all possible node types
      if (typeof child.text === 'string') {
        // @ts-ignore FIXME: TinaMarkdownContent needs to be a union of all possible node types
        return <Leaf components={components} {...child} />
      }

    // console.log(`No tina renderer for ${child.type}`, child)
  }
}
