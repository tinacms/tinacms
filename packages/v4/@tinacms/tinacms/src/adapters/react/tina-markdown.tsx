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
  memo: (render, cacheKey) => <MemoNode render={render} cacheKey={cacheKey} />,
};

const staticReactHost: RichTextHost<React.ReactNode> = {
  ...reactHost,
  memo: undefined,
};

export const TinaMarkdown = <
  CustomComponents extends { [key: string]: object },
>({
  content,
  components = {},
}: RichTextProps<CustomComponents>) => (
  <>{renderRichText(content, components, reactHost)}</>
);

export const StaticTinaMarkdown = <
  CustomComponents extends { [key: string]: object },
>({
  content,
  components = {},
}: RichTextProps<CustomComponents>) => (
  <>{renderRichText(content, components, staticReactHost)}</>
);

// FIXME: needs more testing with custom components. The memo stays by hand:
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
