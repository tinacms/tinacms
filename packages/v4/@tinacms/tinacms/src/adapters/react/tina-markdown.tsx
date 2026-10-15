import React from 'react';
import {
  type RichTextComponents,
  type RichTextHost,
  type TinaMarkdownContent,
  renderRichText,
} from '../../rich-text';

export type { TinaMarkdownContent };

export type Components<ComponentAndProps extends object> = RichTextComponents<
  ComponentAndProps,
  React.JSX.Element
>;

type RichTextProps<CustomComponents extends { [key: string]: object }> = {
  content: TinaMarkdownContent | TinaMarkdownContent[];
  components?: Components<{}> | Components<CustomComponents>;
};

const reactHost: RichTextHost<React.ReactNode> = {
  element: (tag, props, children) =>
    children === null
      ? React.createElement(tag, props)
      : React.createElement(tag, props, children),
  component: (component, props, children) => {
    const Component = component as React.ComponentType<Record<string, unknown>>;
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
  memo: (render, deps) => <MemoNode render={render} deps={deps} />,
};

const staticReactHost: RichTextHost<React.ReactNode> = {
  ...reactHost,
  memo: undefined,
};

// A stable identity. An inline `{}` default makes a new object on each render,
// and the memo in MemoNode then misses for every node.
const NO_COMPONENTS: Components<{}> = {};

export const TinaMarkdown = <
  CustomComponents extends { [key: string]: object },
>({
  content,
  components = NO_COMPONENTS,
}: RichTextProps<CustomComponents>) => (
  <>{renderRichText(content, components, reactHost)}</>
);

export const StaticTinaMarkdown = <
  CustomComponents extends { [key: string]: object },
>({
  content,
  components = NO_COMPONENTS,
}: RichTextProps<CustomComponents>) => (
  <>{renderRichText(content, components, staticReactHost)}</>
);

// React compares the deps by reference. Do not compare them by value: a
// structural key drops the component functions, and two different maps then
// make the same key and the same stale output.
const MemoNode = ({
  render,
  deps,
}: {
  render: () => React.ReactNode;
  deps: readonly unknown[];
}) => {
  const node = React.useMemo(render, deps);
  return <>{node}</>;
};
