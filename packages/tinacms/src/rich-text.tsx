// @ts-nocheck
import React from 'react'

export const TinaMarkdown = ({
  children,
  components = {},
}: {
  children: SlateNodeType[] | { type: 'root'; children: SlateNodeType[] }
  components?: { [key: string]: (props: object) => JSX.Element }
}) => {
  if (!children) {
    return null
  }
  const nodes = Array.isArray(children) ? children : children.children
  return (
    <>
      {nodes.map((child) => {
        switch (child.type) {
          case 'h1':
            return (
              <h1>
                <TinaMarkdown components={components}>
                  {child.children}
                </TinaMarkdown>
              </h1>
            )
          case 'h2':
            return (
              <h2>
                <TinaMarkdown components={components}>
                  {child.children}
                </TinaMarkdown>
              </h2>
            )
          case 'h3':
            return (
              <h3>
                <TinaMarkdown components={components}>
                  {child.children}
                </TinaMarkdown>
              </h3>
            )
          case 'h4':
            return (
              <h4>
                <TinaMarkdown components={components}>
                  {child.children}
                </TinaMarkdown>
              </h4>
            )
          case 'h5':
            return (
              <h5>
                <TinaMarkdown components={components}>
                  {child.children}
                </TinaMarkdown>
              </h5>
            )
          case 'h6':
            return (
              <h6>
                <TinaMarkdown components={components}>
                  {child.children}
                </TinaMarkdown>
              </h6>
            )
          case 'p':
            return (
              <p>
                <TinaMarkdown components={components}>
                  {child.children}
                </TinaMarkdown>
              </p>
            )
          case 'blockquote':
            return (
              <blockquote>
                <TinaMarkdown components={components}>
                  {child.children}
                </TinaMarkdown>
              </blockquote>
            )
          case 'ul':
            return (
              <ul>
                <TinaMarkdown components={components}>
                  {child.children}
                </TinaMarkdown>
              </ul>
            )
          case 'ol':
            return (
              <ol>
                <TinaMarkdown components={components}>
                  {child.children}
                </TinaMarkdown>
              </ol>
            )
          case 'li':
            return (
              <li>
                <TinaMarkdown components={components}>
                  {child.children}
                </TinaMarkdown>
              </li>
            )
          case 'lic':
            return (
              <div>
                <TinaMarkdown components={components}>
                  {child.children}
                </TinaMarkdown>
              </div>
            )
          case 'img':
            return <img src={child.url} alt={child.caption} />
          case 'a':
            return (
              <a href={child.url}>
                <TinaMarkdown components={components}>
                  {child.children}
                </TinaMarkdown>
              </a>
            )
          case 'code_block':
            if (components[child.type]) {
              const Component = components[child.type]
              const { children, ...props } = child
              return (
                <Component {...props} childrenRaw={children}>
                  <TinaMarkdown components={components}>
                    {children}
                  </TinaMarkdown>
                </Component>
              )
            }
            return (
              <pre>
                <code>
                  <TinaMarkdown components={components}>
                    {child.children}
                  </TinaMarkdown>
                </code>
              </pre>
            )
          case 'thematic_break':
            return <hr />
          case 'text':
            return <Leaf {...child} />
          case 'mdxJsxTextElement':
          case 'mdxJsxFlowElement':
            const Block = components[child.name]
            if (Block) {
              const props = child.props ? child.props : {}
              return <Block {...props} />
            } else {
              if (!child.name) {
                throw new Error(`Fragments are not yet supported`)
              }
              throw new Error(`No component provided for ${child.name}`)
            }
          default:
            console.log(child)
            // if (typeof child.text === 'string') {
            //   return child.text
            // }
            return <Leaf {...child} />

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
}) => {
  if (props.bold) {
    const { bold, ...rest } = props
    return (
      <strong>
        <Leaf {...rest} />
      </strong>
    )
  }
  if (props.italic) {
    const { italic, ...rest } = props
    return (
      <em>
        <Leaf {...rest} />
      </em>
    )
  }
  if (props.underline) {
    const { underline, ...rest } = props
    return (
      <u>
        <Leaf {...rest} />
      </u>
    )
  }
  if (props.strikethrough) {
    const { strikethrough, ...rest } = props
    return (
      <s>
        <Leaf {...rest} />
      </s>
    )
  }
  if (props.code) {
    const { code, ...rest } = props
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
