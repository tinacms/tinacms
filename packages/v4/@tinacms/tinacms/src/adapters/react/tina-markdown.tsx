// The React binding of the rich-text renderer.
//
// The render lives in ../../rich-text and names no framework. All that is left here is
// RichTextHost: how React builds an element, calls a component, makes a text value, joins
// siblings, and caches a node. Everything a reader would call rich-text behaviour — the
// node types, the fallback markup, the marks, the tables — is in the core, so a change
// there reaches this binding and every other one without an edit.

import React from 'react';
import {
  type RichTextComponents,
  type RichTextHost,
  type TinaMarkdownContent,
  renderRichText,
} from '../../rich-text';

export type { TinaMarkdownContent };

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
export type Components<ComponentAndProps extends object> = RichTextComponents<
  ComponentAndProps,
  React.JSX.Element
>;

type RichTextProps<CustomComponents extends { [key: string]: object }> = {
  content: TinaMarkdownContent | TinaMarkdownContent[];
  components?:
    | Components<{}>
    | Components<{
        [BK in keyof CustomComponents]: (
          props: CustomComponents[BK]
        ) => React.JSX.Element;
      }>;
};

const reactHost: RichTextHost<React.ReactNode> = {
  element: (tag, props, children) =>
    children === null
      ? React.createElement(tag, props)
      : React.createElement(tag, props, children),
  component: (component, props, children) => {
    const Component = component as React.ComponentType<any>;
    return children === null ? (
      <Component {...props} />
    ) : (
      <Component {...props}>{children}</Component>
    );
  },
  text: (value) => value,
  list: (items) => (
    <>
      {items.map((item, index) => (
        <React.Fragment key={index}>{item}</React.Fragment>
      ))}
    </>
  ),
  memo: (render, cacheKey) => <MemoNode render={render} cacheKey={cacheKey} />,
};

// The same host without the memo, for a tree that renders once. useMemo buys
// as-you-type responsiveness in the editor and buys nothing on a server.
const staticReactHost: RichTextHost<React.ReactNode> = {
  ...reactHost,
  memo: undefined,
};

export const TinaMarkdown = <
  CustomComponents extends { [key: string]: object } = any,
>({
  content,
  components = {},
}: RichTextProps<CustomComponents>) => (
  <>{renderRichText(content, components, reactHost)}</>
);

/** A static-ready TinaMarkdown. The one difference is the memo boundary. */
export const StaticTinaMarkdown = <
  CustomComponents extends { [key: string]: object } = any,
>({
  content,
  components = {},
}: RichTextProps<CustomComponents>) => (
  <>{renderRichText(content, components, staticReactHost)}</>
);

// FIXME: this needs more testing. But in theory all props
// are serializable anyway so the JSON.stringify comparison makes sense.
// I haven't thought all the way through this though, and maybe it'll break
// down with custom components in some way.
// In general this component handles most things without too many issues but for
// large bodies of text it becomes pretty painful to see as-you-type updates, especially
// in Safari.
// The memo stays by hand. It compares the key by content, and the React Compiler
// only memoises by identity — the caller builds a new key on every render, so a
// compiled version would rebuild this subtree each time and bring back the typing lag
// above. The compiler skips this component for the same reason: a JSON.stringify in a
// dependency list is not an expression it can track.
const MemoNode = ({
  render,
  cacheKey,
}: {
  render: () => React.ReactNode;
  cacheKey: unknown;
}) => {
  const node = React.useMemo(render, [JSON.stringify(cacheKey)]);
  return <>{node}</>;
};
