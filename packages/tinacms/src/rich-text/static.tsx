/**
 * This is a static-ready version of the TinaMarkdown component.
 * The primary change is the removal of the `MemoNode` wrapper, which used
 * the `React.useMemo` hook. This hook is for client-side performance
 * optimization and is not needed for server-side rendering (SSR).
 * By rendering the `Node` component directly, the component becomes
 * fully static and can be rendered on the server.
 */

import React from 'react';

type BaseComponents = {
  h1?: { children: JSX.Element };
  h2?: { children: JSX.Element };
  h3?: { children: JSX.Element };
  h4?: { children: JSX.Element };
  h5?: { children: JSX.Element };
  h6?: { children: JSX.Element };
  p?: { children: JSX.Element };
  a?: { url: string; children: JSX.Element };
  italic?: { children: JSX.Element };
  bold?: { children: JSX.Element };
  strikethrough?: { children: JSX.Element };
  underline?: { children: JSX.Element };
  code?: { children: JSX.Element };
  text?: { children: string };
  ul?: { children: JSX.Element };
  ol?: { children: JSX.Element };
  li?: { children: JSX.Element };
  lic?: { children: JSX.Element };
  block_quote?: { children: JSX.Element };
  code_block?: { lang?: string; value: string };
  mermaid?: { value: string };
  img?: { url: string; caption?: string; alt?: string };
  hr?: {};
  break?: {};
  maybe_mdx?: { children: JSX.Element };
  html?: { value: string };
  html_inline?: { value: string };
  table?: {
    align?: ('left' | 'right' | 'center')[];
    tableRows: { tableCells: { value: TinaMarkdownContent }[] }[];
  };
  // Provide a fallback when a JSX component wasn't provided
  component_missing?: { name: string };
};

type BaseComponentSignature = {
  [BK in keyof BaseComponents]: (props: BaseComponents[BK]) => JSX.Element;
};

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
  [K in keyof ComponentAndProps]: (props: ComponentAndProps[K]) => JSX.Element;
} & BaseComponentSignature;

export type TinaMarkdownContent = {
  type: string;
  children: TinaMarkdownContent[];
  // Note: A more robust type would be a discriminated union of all possible node shapes.
  [key: string]: any;
};

export const StaticTinaMarkdown = <
  CustomComponents extends { [key: string]: object } = any,
>({
  content,
  components = {},
}: {
  content: TinaMarkdownContent | TinaMarkdownContent[];
  components?:
    | Components<{}>
    | Components<{
        [BK in keyof CustomComponents]: (
          props: CustomComponents[BK]
        ) => JSX.Element;
      }>;
}) => {
  if (!content) {
    return null;
  }
  const nodes = Array.isArray(content) ? content : content.children;
  if (!nodes) {
    return null;
  }
  return (
    <>
      {nodes.map((child, index) => {
        // Render the Node component directly, removing the client-side MemoNode.
        return <Node components={components} key={index} child={child} />;
      })}
    </>
  );
};

const Leaf = (props: {
  type: 'text';
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  components: Pick<
    BaseComponentSignature,
    'bold' | 'italic' | 'underline' | 'strikethrough' | 'code' | 'text'
  >;
}) => {
  let el: JSX.Element = <>{props.text}</>;

  if (props.components.text) {
    const Component = props.components.text;
    el = <Component>{props.text}</Component>;
  }

  if (props.bold) {
    const Component = props.components.bold || 'strong';
    el = <Component>{el}</Component>;
  }
  if (props.italic) {
    const Component = props.components.italic || 'em';
    el = <Component>{el}</Component>;
  }
  if (props.underline) {
    const Component = props.components.underline || 'u';
    el = <Component>{el}</Component>;
  }
  if (props.strikethrough) {
    const Component = props.components.strikethrough || 's';
    el = <Component>{el}</Component>;
  }
  if (props.code) {
    const Component = props.components.code || 'code';
    el = <Component>{el}</Component>;
  }

  return el;
};

const Node = ({
  components,
  child,
}: {
  components: Components<any>;
  child: TinaMarkdownContent;
}) => {
  const { children, ...props } = child;
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
        const Component = components[child.type];
        return (
          <Component {...props}>
            <StaticTinaMarkdown components={components} content={children} />
          </Component>
        );
      }
      return React.createElement(child.type, {
        children: (
          <StaticTinaMarkdown components={components} content={children} />
        ),
      });
    case 'lic': // List Item Content
      if (components.lic) {
        const Component = components.lic;
        return (
          <Component {...props}>
            <StaticTinaMarkdown components={components} content={children} />
          </Component>
        );
      }
      return (
        <div>
          <StaticTinaMarkdown
            components={components}
            content={child.children}
          />
        </div>
      );
    case 'img':
      if (components[child.type]) {
        const Component = components[child.type];
        //@ts-ignore Same issue with TinaMarkdown
        return <Component {...props} />;
      }
      return <img src={child.url} alt={child.alt} />;
    case 'a':
      if (components[child.type]) {
        const Component = components[child.type];
        return (
          //@ts-ignore Same issue with TinaMarkdown
          <Component {...props}>
            <StaticTinaMarkdown components={components} content={children} />
          </Component>
        );
      }
      return (
        <a href={child.url}>
          <StaticTinaMarkdown components={components} content={children} />
        </a>
      );
    case 'code_block': {
      let codeString = '';
      if (Array.isArray(child.children)) {
        codeString = child.children
          .map((line) =>
            Array.isArray(line.children)
              ? line.children.map((t) => t.text).join('')
              : ''
          )
          .join('\n');
      } else if (typeof child.value === 'string') {
        codeString = child.value;
      }

      if (components[child.type]) {
        const Component = components[child.type];
        return <Component {...props} value={codeString} />;
      }
      return (
        <pre>
          <code>{codeString}</code>
        </pre>
      );
    }

    case 'hr':
      if (components[child.type]) {
        const Component = components[child.type];
        //@ts-ignore Same issue with TinaMarkdown
        return <Component {...props} />;
      }
      return <hr />;
    case 'break':
      if (components[child.type]) {
        const Component = components[child.type];
        //@ts-ignore Same issue with TinaMarkdown
        return <Component {...props} />;
      }
      return <br />;
    case 'text':
      //@ts-ignore Same issue with TinaMarkdown
      return <Leaf components={components} {...child} />;
    case 'mdxJsxTextElement':
    case 'mdxJsxFlowElement':
      const Component = components[child.name];
      if (Component) {
        const props = child.props ? child.props : {};
        return <Component {...props} />;
      } else {
        if (child.name === 'table') {
          const firstRowHeader = child.props?.firstRowHeader;
          const rows =
            (firstRowHeader
              ? child.props?.tableRows.filter((_, i) => i !== 0)
              : child.props?.tableRows) || [];
          const header = child.props?.tableRows?.at(0);
          const TableComponent = //@ts-ignore Same issue with TinaMarkdown
            components['table'] || ((props) => <table {...props} />);
          const TrComponent =
            components['tr'] || ((props) => <tr {...props} />);
          const ThComponent =
            components['th'] ||
            ((props) => (
              <th style={{ textAlign: props?.align || 'auto' }} {...props} />
            ));
          const TdComponent =
            components['td'] ||
            ((props) => (
              <td style={{ textAlign: props?.align || 'auto' }} {...props} />
            ));
          const align = child.props?.align || [];
          return (
            //@ts-ignore Same issue with TinaMarkdown
            <TableComponent>
              {firstRowHeader && (
                <thead>
                  <TrComponent>
                    {header.tableCells.map((c, i) => {
                      return (
                        <StaticTinaMarkdown
                          key={i}
                          components={{
                            p: (props) => (
                              <ThComponent align={align[i]} {...props} />
                            ),
                          }}
                          content={c.value}
                        />
                      );
                    })}
                  </TrComponent>
                </thead>
              )}
              <tbody>
                {rows.map((row, i) => {
                  return (
                    <TrComponent key={i}>
                      {row?.tableCells?.map((c, i) => {
                        return (
                          <StaticTinaMarkdown
                            key={i}
                            components={{
                              p: (props) => (
                                <TdComponent align={align[i]} {...props} />
                              ),
                            }}
                            content={c.value}
                          />
                        );
                      })}
                    </TrComponent>
                  );
                })}
              </tbody>
            </TableComponent>
          );
        }
        const ComponentMissing = components['component_missing'];
        if (ComponentMissing) {
          return <ComponentMissing name={child.name} />;
        } else {
          return <span>{`No component provided for ${child.name}`}</span>;
        }
      }
    case 'table':
      const rows = child.children || [];
      const TableComponent =
        components['table'] ||
        ((
          props //@ts-ignore Same issue with TinaMarkdown
        ) => <table style={{ border: '1px solid #EDECF3' }} {...props} />);
      const TrComponent = components['tr'] || ((props) => <tr {...props} />);
      const TdComponent =
        components['td'] ||
        ((props) => (
          <td
            style={{
              textAlign: props?.align || 'auto',
              border: '1px solid #EDECF3',
              padding: '0.25rem',
            }}
            {...props}
          />
        ));
      const align = child.props?.align || [];
      return (
        //@ts-ignore Same issue with TinaMarkdown
        <TableComponent>
          <tbody>
            {rows.map((row, i) => {
              return (
                <TrComponent key={i}>
                  {row.children?.map((cell, i) => {
                    return (
                      <StaticTinaMarkdown
                        key={i}
                        components={{
                          p: (props) => (
                            <TdComponent align={align[i]} {...props} />
                          ),
                        }}
                        content={cell.children}
                      />
                    );
                  })}
                </TrComponent>
              );
            })}
          </tbody>
        </TableComponent>
      );
    case 'maybe_mdx':
      /**
       * We don't want to render this as it's only displayed while editing an mdx node and should
       * be transformed before form submission
       */
      return null;
    case 'html':
    case 'html_inline':
      if (components[child.type]) {
        const Component = components[child.type];
        //@ts-ignore Same issue with TinaMarkdown
        return <Component {...props} />;
      }
      return child.value;
    case 'invalid_markdown':
      return <pre>{child.value}</pre>;
    default:
      if (typeof child.text === 'string') {
        //@ts-ignore Same issue with TinaMarkdown
        return <Leaf components={components} {...child} />;
      }
      return null;
  }
};
