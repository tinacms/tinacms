import React, { Fragment } from 'react'
import { Node } from 'unist'
import {
  Root,
  BlockContent,
  DefinitionContent,
  Paragraph,
  Code,
  Heading,
  HTML,
  Image,
  ImageReference,
  InlineCode,
  Link,
  LinkReference,
  List,
  ListItem,
  PhrasingContent,
  StaticPhrasingContent,
  Text,
  Emphasis,
  Strong,
  Footnote,
  Delete,
  Table,
  TableRow,
  TableCell,
  Blockquote,
  FootnoteDefinition,
} from 'mdast'

import { Ast, Json } from '..'

export const TinaMarkdown = ({ content }: { content: Ast }) => {
  return (
    <>
      {content.children.map((child) => (
        <RootChildRenderer key={generateKey(child)} node={child} />
      ))}
    </>
  )
}

const RootChildRenderer = ({ node }: { node: Root['children'][number] }) => {
  switch (node.type) {
    case 'blockquote':
      return <BlockquoteRenderer node={node} />
    case 'listItem':
      return <ListIemRenderer node={node} />
    case 'footnoteDefinition':
      return <FootnoteDefinitionRenderer node={node} />
    case 'containerDirective':
      return <div></div>
    case 'break':
      return <StaticPhrasingContentRenderer node={node} />
    case 'code': {
      return <CodeRenderer node={node} />
    }
    case 'definition': {
      return <div>Definition</div>
    }
    case 'heading':
      return <HeadingRenderer node={node} />
    case 'paragraph':
      return <ParagraphRenderer node={node} />
    case 'delete':
      return <DeleteRenderer node={node} />
    case 'emphasis':
      return <EmphasisRenderer node={node} />
    case 'strong':
      return <StrongRenderer node={node} />
    case 'footnote':
      return <FootnoteRenderer node={node} />
    case 'tableCell':
      return <TableCellRenderer node={node} />
    case 'leafDirective':
    case 'mdxJsxTextElement':
    case 'textDirective': {
      return (
        <>
          {node.children.map((child) => (
            <PhrasingContentRenderer key={generateKey(child)} node={child} />
          ))}
        </>
      )
    }
    case 'footnoteReference': {
      return <div>Footnote Reference</div>
    }
    case 'html': {
      return <Html node={node} />
    }
    case 'image': {
      return <ImageRenderer node={node} />
    }
    case 'imageReference': {
      return <ImageReferenceRenderer node={node} />
    }
    case 'inlineCode': {
      return <InlineCodeRenderer node={node} />
    }
    case 'link': {
      return <LinkRenderer node={node} />
    }
    case 'linkReference': {
      return <LinkReferenceRenderer node={node} />
    }
    case 'list': {
      return <ListRenderer node={node} />
    }
    case 'mdxFlowExpression': {
      return <div>MDX Flow Expression</div>
    }
    case 'mdxJsxFlowElement': {
      return (
        <>
          {node.children.map((child) => (
            <BlockContentRenderer key={generateKey(child)} node={child} />
          ))}
        </>
      )
    }
    case 'mdxTextExpression': {
      return <div>MDX Text Expression</div>
    }
    case 'mdxjsEsm': {
      return <div>MDX JS ESM</div>
    }
    case 'table': {
      return <TableRenderer node={node} />
    }
    case 'tableRow': {
      return <tr>table cell</tr>
    }
    case 'text': {
      return <TextRenderer node={node} />
    }
    case 'thematicBreak': {
      return <hr />
    }
    case 'yaml': {
      return <div>YAML</div>
    }
  }
  if (node.type === 'shortcode') {
    return (
      <div className="my-4 bg-gray-200 p-2 rounded-md shadow-md">
        <Json src={node} />
      </div>
    )
  }
  // @ts-expect-error
  // throw new Error(`Unexpected node of type ${node.type}`);
  return <div></div>
}

const BlockContentOrDefinitionRenderer = ({
  node,
}: {
  node: BlockContent | DefinitionContent
}) => {
  switch (node.type) {
    case 'definition': {
      return null
    }
    case 'footnoteDefinition': {
      return <FootnoteDefinitionRenderer node={node} />
    }
  }
  return <BlockContentRenderer node={node} />
}

const FootnoteDefinitionRenderer = ({ node }: { node: FootnoteDefinition }) => {
  return (
    <small>
      {node.children.map((child) => {
        return (
          <BlockContentOrDefinitionRenderer
            key={generateKey(child)}
            node={child}
          />
        )
      })}
    </small>
  )
}

const BlockContentRenderer = ({ node }: { node: BlockContent }) => {
  switch (node.type) {
    case 'blockquote': {
      return <BlockquoteRenderer node={node} />
    }
    case 'code': {
      return <CodeRenderer node={node} />
    }
    case 'containerDirective': {
      return (
        <>
          {node.children.map((child) => {
            return (
              <BlockContentOrDefinitionRenderer
                key={generateKey(child)}
                node={child}
              />
            )
          })}
        </>
      )
    }
    case 'heading': {
      return <HeadingRenderer node={node} />
    }
    case 'html': {
      return <Html node={node} />
    }
    case 'leafDirective': {
      return (
        <>
          {node.children.map((child) => {
            return (
              <PhrasingContentRenderer key={generateKey(child)} node={child} />
            )
          })}
        </>
      )
    }
    case 'list': {
      return <ListRenderer node={node} />
    }
    case 'mdxFlowExpression': {
      return (
        <pre>
          <code>{node.value}</code>
        </pre>
      )
    }
    case 'mdxJsxFlowElement': {
      return (
        <div>
          {node.children.map((child) => {
            return (
              <BlockContentRenderer key={generateKey(child)} node={child} />
            )
          })}
        </div>
      )
    }
    case 'paragraph': {
      return (
        <p>
          {node.children.map((child) => {
            return (
              <PhrasingContentRenderer key={generateKey(child)} node={child} />
            )
          })}
        </p>
      )
    }
    case 'table': {
      return <div>Table</div>
    }
    case 'thematicBreak': {
      return <hr />
    }
  }
  return <div>Block Content or Definition</div>
}

const PhrasingContentRenderer = ({ node }: { node: PhrasingContent }) => {
  switch (node.type) {
    case 'link': {
      return (
        <a href={node.url}>
          {node.children.map((child) => {
            return (
              <StaticPhrasingContentRenderer
                key={generateKey(child)}
                node={child}
              />
            )
          })}
        </a>
      )
    }
    case 'linkReference': {
      return null
    }
  }
  return <StaticPhrasingContentRenderer node={node} />
}
const StaticPhrasingContentRenderer = ({
  node,
}: {
  node: StaticPhrasingContent
}) => {
  switch (node.type) {
    case 'break': {
      return <br />
    }
    case 'delete': {
      return (
        <s>
          {node.children.map((child) => {
            return (
              <PhrasingContentRenderer key={generateKey(child)} node={child} />
            )
          })}
        </s>
      )
    }
    case 'emphasis': {
      return <EmphasisRenderer node={node} />
    }
    case 'footnote': {
      return (
        <small>
          {node.children.map((child) => {
            return (
              <PhrasingContentRenderer key={generateKey(child)} node={child} />
            )
          })}
        </small>
      )
    }
    case 'footnoteReference': {
      return null
    }
    case 'html': {
      return (
        <pre>
          <code>{node.value}</code>
        </pre>
      )
    }
    case 'image': {
      return <img src={node.url} />
    }
    case 'imageReference': {
      return null
    }
    case 'inlineCode': {
      return <code>{node.value}</code>
    }
    case 'mdxJsxTextElement': {
      return (
        <>
          {node.children.map((child) => {
            return (
              <PhrasingContentRenderer key={generateKey(child)} node={child} />
            )
          })}
        </>
      )
    }
    case 'mdxTextExpression': {
      return (
        <pre>
          <code>{node.value}</code>
        </pre>
      )
    }
    case 'strong': {
      return <StrongRenderer node={node} />
    }
    case 'text': {
      return <span>{node.value}</span>
    }
    case 'textDirective': {
      return (
        <span>
          {node.children.map((child) => (
            <PhrasingContentRenderer key={generateKey(child)} node={child} />
          ))}
        </span>
      )
    }
  }
  // @ts-expect-error
  throw new Error(`Unexpected node of type ${node.type}`)
}

const ListIemRenderer = ({ node }: { node: ListItem }) => {
  return (
    <li>
      {node.children.map((child) => {
        return (
          <BlockContentOrDefinitionRenderer
            key={generateKey(child)}
            node={child}
          />
        )
      })}
    </li>
  )
}
function createMarkup(string: string) {
  return { __html: string }
}

const Html = ({ node }: { node: HTML }) => {
  return <div dangerouslySetInnerHTML={createMarkup(node.value)} />
}

const CodeRenderer = ({ node }: { node: Code }) => {
  return (
    <div>
      <pre>
        <code>{node.value}</code>
      </pre>
    </div>
  )
}

const TextRenderer = ({ node }: { node: Text }) => {
  return <>{node.value}</>
}
const ParagraphRenderer = ({ node }: { node: Paragraph }) => {
  return (
    <p>
      {node.children.map((child, index) => {
        return <PhrasingContentRenderer key={generateKey(child)} node={child} />
      })}
    </p>
  )
}
const HeadingRenderer = ({ node }: { node: Heading }) => {
  const children = node.children.map((child) => {
    return <PhrasingContentRenderer key={generateKey(child)} node={child} />
  })
  switch (node.depth) {
    case 1: {
      return <h1>{children}</h1>
    }
    case 2: {
      return <h2>{children}</h2>
    }
    case 3: {
      return <h3>{children}</h3>
    }
    case 4: {
      return <h4>{children}</h4>
    }
    case 5: {
      return <h5>{children}</h5>
    }
    case 6: {
      return <h6>{children}</h6>
    }
  }
}

const DeleteRenderer = ({ node }: { node: Delete }) => {
  return (
    <s>
      {node.children.map((child) => {
        return <PhrasingContentRenderer key={generateKey(child)} node={child} />
      })}
    </s>
  )
}

const EmphasisRenderer = ({ node }: { node: Emphasis }) => {
  return (
    <em>
      {node.children.map((child) => {
        return <PhrasingContentRenderer key={generateKey(child)} node={child} />
      })}
    </em>
  )
}
const StrongRenderer = ({ node }: { node: Strong }) => {
  return (
    <b>
      {node.children.map((child) => {
        return <PhrasingContentRenderer key={generateKey(child)} node={child} />
      })}
    </b>
  )
}

const FootnoteRenderer = ({ node }: { node: Footnote }) => {
  return (
    <>
      {node.children.map((child) => (
        <PhrasingContentRenderer key={generateKey(child)} node={child} />
      ))}
    </>
  )
}

const LinkRenderer = ({ node }: { node: Link }) => {
  return (
    <a href={node.url}>
      {node.children.map((child) => {
        return (
          <StaticPhrasingContentRenderer
            key={generateKey(child)}
            node={child}
          />
        )
      })}
    </a>
  )
}

const LinkReferenceRenderer = ({ node }: { node: LinkReference }) => {
  // TODO get reference
  return (
    <a href={''}>
      {node.children.map((child) => {
        return (
          <StaticPhrasingContentRenderer
            key={generateKey(child)}
            node={child}
          />
        )
      })}
    </a>
  )
}

const ListRenderer = ({ node }: { node: List }) => {
  if (node.ordered) {
    return (
      <ol>
        {node.children.map((child) => {
          return <ListIemRenderer key={generateKey(child)} node={child} />
        })}
      </ol>
    )
  } else {
    return (
      <ul>
        {node.children.map((child) => {
          return <ListIemRenderer key={generateKey(child)} node={child} />
        })}
      </ul>
    )
  }
}

const InlineCodeRenderer = ({ node }: { node: InlineCode }) => {
  return <code>{node.value}</code>
}

const ImageRenderer = ({ node }: { node: Image }) => {
  return <img src={node.url} alt={node.alt || ''} />
}

const ImageReferenceRenderer = ({ node }: { node: ImageReference }) => {
  // TODO: get reference
  node.identifier
  return <img src={''} alt={node.alt || ''} />
}

const TableRenderer = ({ node }: { node: Table }) => {
  return (
    <table>
      {node.children.map((child, index) => {
        return (
          <TableRowRenderer
            key={generateKey(child)}
            node={child}
            asHeaders={index === 0}
          />
        )
      })}
    </table>
  )
}

const TableRowRenderer = ({
  node,
  asHeaders,
}: {
  node: TableRow
  asHeaders?: boolean
}) => {
  return (
    <tr>
      {node.children.map((child) => {
        return (
          <TableCellRenderer
            key={generateKey(child)}
            node={child}
            asHeaders={asHeaders}
          />
        )
      })}
    </tr>
  )
}
const TableCellRenderer = ({
  node,
  asHeaders,
}: {
  node: TableCell
  asHeaders?: boolean
}) => {
  if (asHeaders) {
    return (
      <th>
        {node.children.map((child) => (
          <PhrasingContentRenderer key={generateKey(child)} node={child} />
        ))}
      </th>
    )
  }
  return (
    <td>
      {node.children.map((child) => (
        <PhrasingContentRenderer key={generateKey(child)} node={child} />
      ))}
    </td>
  )
}

const BlockquoteRenderer = ({ node }: { node: Blockquote }) => {
  return (
    <blockquote>
      {node.children.map((child) => {
        return (
          <BlockContentOrDefinitionRenderer
            key={generateKey(child)}
            node={child}
          />
        )
      })}
    </blockquote>
  )
}

const generateKey = (node: Node) => {
  return `${node.position?.start.line}-${node.position?.start.column}`
}
