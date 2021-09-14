import React from 'react'

export const TinaMarkdown = ({
  children,
  blocks = {},
}: {
  children: SlateNodeType[] | { type: 'root'; children: SlateNodeType[] }
  blocks?: { [key: string]: (props: object) => JSX.Element }
}) => {
  const nodes = Array.isArray(children) ? children : children.children
  return (
    <>
      {nodes.map((child) => {
        switch (child.type) {
          case 'heading_one':
            return (
              <h1>
                <TinaMarkdown blocks={blocks}>{child.children}</TinaMarkdown>
              </h1>
            )
          case 'heading_two':
            return (
              <h2>
                <TinaMarkdown blocks={blocks}>{child.children}</TinaMarkdown>
              </h2>
            )
          case 'heading_three':
            return (
              <h3>
                <TinaMarkdown blocks={blocks}>{child.children}</TinaMarkdown>
              </h3>
            )
          case 'heading_four':
            return (
              <h4>
                <TinaMarkdown blocks={blocks}>{child.children}</TinaMarkdown>
              </h4>
            )
          case 'heading_five':
            return (
              <h5>
                <TinaMarkdown blocks={blocks}>{child.children}</TinaMarkdown>
              </h5>
            )
          case 'heading_six':
            return (
              <h6>
                <TinaMarkdown blocks={blocks}>{child.children}</TinaMarkdown>
              </h6>
            )
          case 'paragraph':
            return (
              <p>
                <TinaMarkdown blocks={blocks}>{child.children}</TinaMarkdown>
              </p>
            )
          case 'block_quote':
            return (
              <blockquote>
                <TinaMarkdown blocks={blocks}>{child.children}</TinaMarkdown>
              </blockquote>
            )
          case 'image':
            return <img src={child.link} alt={child.caption} />
          case 'link':
            return (
              <a href={child.link}>
                <TinaMarkdown blocks={blocks}>{child.children}</TinaMarkdown>
              </a>
            )
          case 'code_block':
            return (
              <pre>
                <code>
                  <TinaMarkdown blocks={blocks}>{child.children}</TinaMarkdown>
                </code>
              </pre>
            )
          case 'thematic_break':
            return <hr />
          case 'text':
            if (child.bold) {
              return <strong>{child.text}</strong>
            }
            if (child.italic) {
              return <em>{child.text}</em>
            }

            return child.text
          case 'mdxJsxTextElement':
          case 'mdxJsxFlowElement':
            const Block = blocks[child.name]
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
            if (typeof child.text === 'string') {
              return child.text
            }
            console.log(`No tina renderer for ${child.type}`, child)
        }
      })}
    </>
  )
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
