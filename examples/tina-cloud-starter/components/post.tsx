import React from "react";
import Markdown from "react-markdown";
import { Container } from "./container";
import { Section } from "./section";
import { ThemeContext } from "./theme";
import format from "date-fns/format";

export const Post = ({ data }) => {
  const theme = React.useContext(ThemeContext);
  const titleColorClasses = {
    blue: "from-blue-400 to-blue-600 dark:from-blue-300 dark:to-blue-500",
    teal: "from-teal-400 to-teal-600 dark:from-teal-300 dark:to-teal-500",
    green: "from-green-400 to-green-600",
    red: "from-red-400 to-red-600",
    pink: "from-pink-300 to-pink-500",
    purple:
      "from-purple-400 to-purple-600 dark:from-purple-300 dark:to-purple-500",
    orange:
      "from-orange-300 to-orange-600 dark:from-orange-200 dark:to-orange-500",
    yellow:
      "from-yellow-400 to-yellow-500 dark:from-yellow-300 dark:to-yellow-500",
  };

  const date = new Date(data.date);
  const formattedDate = format(date, "MMM dd, yyyy");

  return (
    <Section className="flex-1">
      <Container className={`flex-1 max-w-4xl pb-2`} size="large">
        <h2
          className={`w-full relative	mb-8 text-6xl font-extrabold tracking-normal text-center title-font`}
        >
          <span
            className={`bg-clip-text text-transparent bg-gradient-to-r ${
              titleColorClasses[theme.color]
            }`}
          >
            {data.title}
          </span>
        </h2>

        <div className="flex items-center justify-center mb-16">
          {data.author && (
            <>
              <div className="flex-shrink-0 mr-4">
                <img
                  className="h-14 w-14 object-cover rounded-full shadow-sm"
                  src={data.author.data.avatar}
                  alt={data.author.data.name}
                />
              </div>
              <p className="text-base font-medium text-gray-600 group-hover:text-gray-800 dark:text-gray-200 dark:group-hover:text-white">
                {data.author.data.name}
              </p>
              <span className="font-bold text-gray-200 dark:text-gray-500 mx-2">
                —
              </span>
            </>
          )}
          <p className="text-base text-gray-400 group-hover:text-gray-500 dark:text-gray-300 dark:group-hover:text-gray-150">
            {formattedDate}
          </p>
        </div>
      </Container>
      {data.heroImg && (
        <div className="">
          <img
            src={data.heroImg}
            className="mb-14 block h-auto max-w-4xl lg:max-w-6xl mx-auto"
          />
        </div>
      )}
      <Container className={`flex-1 max-w-4xl pt-4`} size="large">
        <div className="prose dark:prose-dark  w-full max-w-none">
          <Markdown2>{data._body}</Markdown2>
        </div>
      </Container>
    </Section>
  );
};

import type { Root, Content } from "mdast";
import type { Descendant } from "slate";
import { Hero } from "./blocks/hero";

const Markdown2 = (props) => {
  if (typeof props.children === "string") {
    return <Markdown>{props.children}</Markdown>;
  } else {
    const ast = props.children as Root;
    if (props.children.type === "root") {
      return (
        <MarkdownContent templates={props.children._field.templates}>
          {ast.children}
        </MarkdownContent>
      );
    } else {
      return <SlateContent>{props.children}</SlateContent>;
    }
  }
};

const Link = (props) => {
  return <a href={props.to}>Link to {props.label}</a>;
};
const SlateContent = ({
  children,
  blocks = {
    Hero: (props) => <Hero data={props} />,
    Link: (props) => <Link {...props} />,
  },
}: {
  children: Descendant[];
}) => {
  return (
    <>
      {children.map((child) => {
        switch (child.type) {
          case defaultNodeTypes.heading[1]:
            return (
              <h1>
                <SlateContent>{child.children}</SlateContent>
              </h1>
            );
          case defaultNodeTypes.heading[2]:
            return (
              <h2>
                <SlateContent>{child.children}</SlateContent>
              </h2>
            );
          case defaultNodeTypes.heading[3]:
            return (
              <h3>
                <SlateContent>{child.children}</SlateContent>
              </h3>
            );
          case defaultNodeTypes.heading[4]:
            return (
              <h4>
                <SlateContent>{child.children}</SlateContent>
              </h4>
            );
          case defaultNodeTypes.heading[5]:
            return (
              <h5>
                <SlateContent>{child.children}</SlateContent>
              </h5>
            );
          case defaultNodeTypes.heading[6]:
            return (
              <h1>
                <SlateContent>{child.children}</SlateContent>
              </h1>
            );
          case defaultNodeTypes.paragraph:
            return (
              <p>
                <SlateContent>{child.children}</SlateContent>
              </p>
            );
          case defaultNodeTypes.link:
            return (
              <a href={child.link}>
                <SlateContent>{child.children}</SlateContent>
              </a>
            );
          default:
            if (!child.text) {
              console.log(`Didn't find element of type ${child.type}`, child);
            }
            return child.text;
        }
      })}
    </>
  );
};

const MarkdownContent = ({
  children,
  blocks = {
    Hero: (props) => <Hero data={props} />,
    Link: (props) => <Link {...props} />,
  },
  templates,
}: {
  children: Content[];
  blocks?: { [key: string]: (props) => React.ReactNode };
  templates?: object[];
}) => {
  return (
    <>
      {children.map((child) => {
        switch (child.type) {
          case "heading":
            switch (child.depth) {
              case 1:
                return (
                  <h1>
                    <MarkdownContent>{child.children}</MarkdownContent>
                  </h1>
                );
              case 2:
                return (
                  <h2>
                    <MarkdownContent>{child.children}</MarkdownContent>
                  </h2>
                );
              case 3:
                return (
                  <h3>
                    <MarkdownContent>{child.children}</MarkdownContent>
                  </h3>
                );
              case 4:
                return (
                  <h4>
                    <MarkdownContent>{child.children}</MarkdownContent>
                  </h4>
                );
              case 5:
                return (
                  <h5>
                    <MarkdownContent>{child.children}</MarkdownContent>
                  </h5>
                );
              case 6:
                return (
                  <h6>
                    <MarkdownContent>{child.children}</MarkdownContent>
                  </h6>
                );
            }
          case "paragraph":
            return (
              <p>
                <MarkdownContent>{child.children}</MarkdownContent>
              </p>
            );
          case "link":
            return (
              <a href={child.url} title={child.title}>
                <MarkdownContent>{child.children}</MarkdownContent>
              </a>
            );
          case "break":
            return <br />;
          case "thematicBreak":
            return <hr />;
          case "text":
            return <span>{child.value}</span>;
          // for some reason html inline elements are here
          case "mdxJsxTextElement":
            const InlineBlock = blocks[child.name];
            const inlineProps = {};
            child.attributes.forEach((att) => {
              inlineProps[att.name] = att.value;
            });
            if (InlineBlock) {
              return <InlineBlock {...inlineProps} />;
            }
            const atts = {};
            child.attributes.forEach((att) => (atts[att.name] = att.value));
            return React.createElement(child.name, {
              ...atts,
              children: <MarkdownContent>{child.children}</MarkdownContent>,
            });
          // for some reason html block elements are here
          case "mdxJsxFlowElement":
            const Block = blocks[child.name];
            const props = {};
            child.attributes.forEach((att) => {
              if (att.value?.type === "mdxJsxAttributeValueExpression") {
                if (att.value.data) {
                  att.value.data.estree.body.forEach((item) => {
                    if (item.type === "ExpressionStatement") {
                      console.log(item);
                      if (item.expression.type === "ArrayExpression") {
                        const elements = [];
                        item.expression.elements.forEach((element) => {
                          if (element.type === "Literal") {
                            // console.log(element);
                            elements.push(element.value);
                          }
                        });
                        props[att.name] = elements;
                      }
                      if (item.expression.type === "ObjectExpression") {
                        item.expression.properties.forEach((property) => {
                          props[att.name] = {
                            [property.key.name]: property.value.value,
                          };
                        });
                      }
                    }
                  });
                }
              } else {
                props[att.name] = att.value;
              }
            });
            console.log(props);
            if (Block) {
              return <Block {...props} />;
            }

            const blockAtts = {};
            child.attributes.forEach(
              (att) => (blockAtts[att.name] = att.value)
            );
            // Void elements can't have `children`, there are a lot of others
            const extraProps = ["img"].includes(child.name)
              ? {}
              : {
                  children: <MarkdownContent>{child.children}</MarkdownContent>,
                };
            return React.createElement(child.name, {
              ...blockAtts,
              ...extraProps,
            });
          default:
            console.log("not found ", child.type);
            return <div>NOT FOUND</div>;
        }
      })}
    </>
  );
};

export interface NodeTypes {
  paragraph: string;
  block_quote: string;
  code_block: string;
  link: string;
  image: string;
  ul_list: string;
  ol_list: string;
  listItem: string;
  heading: {
    1: string;
    2: string;
    3: string;
    4: string;
    5: string;
    6: string;
  };
  emphasis_mark: string;
  strong_mark: string;
  delete_mark: string;
  inline_code_mark: string;
  thematic_break: string;
}

type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

export interface OptionType {
  nodeTypes?: RecursivePartial<NodeTypes>;
  linkDestinationKey?: string;
  imageSourceKey?: string;
  imageCaptionKey?: string;
}

export interface MdastNode {
  type?: string;
  ordered?: boolean;
  value?: string;
  text?: string;
  children?: Array<MdastNode>;
  depth?: 1 | 2 | 3 | 4 | 5 | 6;
  url?: string;
  alt?: string;
  lang?: string;
  // mdast metadata
  position?: any;
  spread?: any;
  checked?: any;
  indent?: any;
}

export const defaultNodeTypes: NodeTypes = {
  paragraph: "paragraph",
  block_quote: "block_quote",
  code_block: "code_block",
  link: "link",
  ul_list: "ul_list",
  ol_list: "ol_list",
  listItem: "list_item",
  heading: {
    1: "heading_one",
    2: "heading_two",
    3: "heading_three",
    4: "heading_four",
    5: "heading_five",
    6: "heading_six",
  },
  emphasis_mark: "italic",
  strong_mark: "bold",
  delete_mark: "strikeThrough",
  inline_code_mark: "code",
  thematic_break: "thematic_break",
  image: "image",
};

export function deserialize(node: MdastNode, opts?: OptionType) {
  const types = {
    ...defaultNodeTypes,
    ...opts?.nodeTypes,
    heading: {
      ...defaultNodeTypes.heading,
      ...opts?.nodeTypes?.heading,
    },
  };

  const linkDestinationKey = opts?.linkDestinationKey ?? "link";
  const imageSourceKey = opts?.imageSourceKey ?? "link";
  const imageCaptionKey = opts?.imageCaptionKey ?? "caption";

  let children = [{ text: "" }];

  if (
    node.children &&
    Array.isArray(node.children) &&
    node.children.length > 0
  ) {
    children = node.children.map((c: MdastNode) =>
      deserialize(
        {
          ...c,
          ordered: node.ordered || false,
        },
        opts
      )
    );
  }

  switch (node.type) {
    case "heading":
      return { type: types.heading[node.depth || 1], children };
    case "list":
      return { type: node.ordered ? types.ol_list : types.ul_list, children };
    case "listItem":
      return { type: types.listItem, children };
    case "paragraph":
      return { type: types.paragraph, children };
    case "link":
      return { type: types.link, [linkDestinationKey]: node.url, children };
    case "image":
      return {
        type: types.image,
        children: [{ text: "" }],
        [imageSourceKey]: node.url,
        [imageCaptionKey]: node.alt,
      };
    case "blockquote":
      return { type: types.block_quote, children };
    case "code":
      return {
        type: types.code_block,
        language: node.lang,
        children: [{ text: node.value }],
      };

    case "html":
      if (node.value?.includes("<br>")) {
        return {
          break: true,
          type: types.paragraph,
          children: [{ text: node.value?.replace(/<br>/g, "") || "" }],
        };
      }
      return { type: "paragraph", children: [{ text: node.value || "" }] };

    case "emphasis":
      return {
        [types.emphasis_mark]: true,
        ...forceLeafNode(children),
        ...persistLeafFormats(children),
      };
    case "strong":
      return {
        [types.strong_mark]: true,
        ...forceLeafNode(children),
        ...persistLeafFormats(children),
      };
    case "delete":
      return {
        [types.delete_mark]: true,
        ...forceLeafNode(children),
        ...persistLeafFormats(children),
      };
    case "inlineCode":
      return {
        [types.inline_code_mark]: true,
        text: node.value,
        ...persistLeafFormats(children),
      };
    case "thematicBreak":
      return {
        type: types.thematic_break,
        children: [{ text: "" }],
      };

    case "root":
      return children;
    case "mdxJsxTextElement":
      return {
        type: "mdxJsxTextElement",
        node: node,
        children: [{ text: "" }],
      };
    case "mdxJsxFlowElement":
      return {
        type: "mdxJsxFlowElement",
        node: node,
        children: [{ text: "" }],
      };
    case "text":
    default:
      return { text: node.value || "" };
  }
}

const forceLeafNode = (children: Array<{ text?: string }>) => ({
  text: children.map((k) => k?.text).join(""),
});

// This function is will take any unknown keys, and bring them up a level
// allowing leaf nodes to have many different formats at once
// for example, bold and italic on the same node
function persistLeafFormats(children: Array<MdastNode>) {
  return children.reduce((acc, node) => {
    Object.keys(node).forEach(function (key) {
      if (key === "children" || key === "type" || key === "text") return;

      // @ts-ignore
      acc[key] = node[key];
    });

    return acc;
  }, {});
}

export interface LeafType {
  text: string;
  strikeThrough?: boolean;
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
  parentType?: string;
}

export interface BlockType {
  type: string;
  parentType?: string;
  link?: string;
  caption?: string;
  language?: string;
  break?: boolean;
  children: Array<BlockType | LeafType>;
}

interface Options {
  nodeTypes: NodeTypes;
  listDepth?: number;
  ignoreParagraphNewline?: boolean;
}

const isLeafNode = (node: BlockType | LeafType): node is LeafType => {
  return typeof (node as LeafType).text === "string";
};

const VOID_ELEMENTS: Array<keyof NodeTypes> = ["thematic_break"];

const BREAK_TAG = "<br>";

export function serialize(
  chunk: BlockType | LeafType,
  opts: Options = { nodeTypes: defaultNodeTypes }
): Content {
  const {
    nodeTypes: userNodeTypes = defaultNodeTypes,
    ignoreParagraphNewline = false,
    listDepth = 0,
  } = opts;

  let text = (chunk as LeafType).text || "";
  let emptyText = { type: "text", value: text };
  let type = (chunk as BlockType).type || "text";

  const nodeTypes: NodeTypes = {
    ...defaultNodeTypes,
    ...userNodeTypes,
    heading: {
      ...defaultNodeTypes.heading,
      ...userNodeTypes.heading,
    },
  };

  const LIST_TYPES = [nodeTypes.ul_list, nodeTypes.ol_list];

  let children: Content[] = [{ type: "text", value: text }];

  if (!isLeafNode(chunk)) {
    children = chunk.children
      .map((c: BlockType | LeafType) => {
        const isList = !isLeafNode(c)
          ? LIST_TYPES.includes(c.type || "")
          : false;

        const selfIsList = LIST_TYPES.includes(chunk.type || "");

        // Links can have the following shape
        // In which case we don't want to surround
        // with break tags
        // {
        //  type: 'paragraph',
        //  children: [
        //    { text: '' },
        //    { type: 'link', children: [{ text: foo.com }]}
        //    { text: '' }
        //  ]
        // }
        let childrenHasLink = false;

        if (!isLeafNode(chunk) && Array.isArray(chunk.children)) {
          childrenHasLink = chunk.children.some(
            (f) => !isLeafNode(f) && f.type === nodeTypes.link
          );
        }

        return serialize(
          { ...c, parentType: type },
          {
            nodeTypes,
            // WOAH.
            // what we're doing here is pretty tricky, it relates to the block below where
            // we check for ignoreParagraphNewline and set type to paragraph.
            // We want to strip out empty paragraphs sometimes, but other times we don't.
            // If we're the descendant of a list, we know we don't want a bunch
            // of whitespace. If we're parallel to a link we also don't want
            // to respect neighboring paragraphs
            ignoreParagraphNewline:
              (ignoreParagraphNewline ||
                isList ||
                selfIsList ||
                childrenHasLink) &&
              // if we have c.break, never ignore empty paragraph new line
              !(c as BlockType).break,

            // track depth of nested lists so we can add proper spacing
            listDepth: LIST_TYPES.includes((c as BlockType).type || "")
              ? listDepth + 1
              : listDepth,
          }
        );
      })
      .join("");
  }

  // This is pretty fragile code, check the long comment where we iterate over children
  if (
    !ignoreParagraphNewline &&
    (text === "" || text === "\n") &&
    chunk.parentType === nodeTypes.paragraph
  ) {
    type = nodeTypes.paragraph;
    children = [{ type: "html", value: "<br />" }];
  }

  // if (
  //   children[0]?.value === "" &&
  //   !VOID_ELEMENTS.find((k) => nodeTypes[k] === type)
  // )
  //   return;

  // Never allow decorating break tags with rich text formatting,
  // this can malform generated markdown
  // Also ensure we're only ever applying text formatting to leaf node
  // level chunks, otherwise we can end up in a situation where
  // we try applying formatting like to a node like this:
  // "Text foo bar **baz**" resulting in "**Text foo bar **baz****"
  // which is invalid markup and can mess everything up
  // if (children[0]?.value !== BREAK_TAG && isLeafNode(chunk)) {
  //   if (chunk.bold && chunk.italic) {
  //     children = retainWhitespaceAndFormat(children, ["strong", "emphasis"]);
  //   } else {
  //     if (chunk.bold) {
  //       children = retainWhitespaceAndFormat(children, ["strong"]);
  //     }

  //     if (chunk.italic) {
  //       children = retainWhitespaceAndFormat(children, ["italic"]);
  //     }
  //     // Tina: Not supported
  //     if (chunk.strikeThrough) {
  //       children = retainWhitespaceAndFormat(children, ["strikethrough"]);
  //     }
  //     if (chunk.code) {
  //       children = retainWhitespaceAndFormat(children, ["inline-code"]);
  //     }
  //   }
  // }

  switch (type) {
    case nodeTypes.heading[1]:
      return {
        type: "heading",
        depth: 1,
        children,
      };
    case nodeTypes.heading[2]:
      return {
        type: "heading",
        depth: 2,
        children,
      };
    case nodeTypes.heading[3]:
      return {
        type: "heading",
        depth: 3,
        children,
      };
    case nodeTypes.heading[4]:
      return {
        type: "heading",
        depth: 4,
        children,
      };
    case nodeTypes.heading[5]:
      return {
        type: "heading",
        depth: 5,
        children,
      };
    case nodeTypes.heading[6]:
      return {
        type: "heading",
        depth: 6,
        children,
      };

    case nodeTypes.block_quote:
      // For some reason, marked is parsing blockquotes w/ one new line
      // as contiued blockquotes, so adding two new lines ensures that doesn't
      // happen
      return {
        type: "blockquote",
        children,
      };

    case nodeTypes.code_block:
      return {
        type: "code",
        lang: (chunk as BlockType).language || "",
        value: children,
      };
      return `\`\`\`${
        (chunk as BlockType).language || ""
      }\n${children}\n\`\`\`\n`;

    case nodeTypes.link:
      return {
        type: "link",
        title: null,
        url: (chunk as BlockType).link,
        children,
      };
      return `[${children}](${(chunk as BlockType).link || ""})`;
    case nodeTypes.image:
      return {
        type: "link",
        title: null,
        url: (chunk as BlockType).link,
        alt: (chunk as BlockType).caption,
      };
      return `![${(chunk as BlockType).caption}](${
        (chunk as BlockType).link || ""
      })`;

    case nodeTypes.ul_list:
      return {
        type: "list",
        ordered: false,
        spread: false,
        children,
      };
    case nodeTypes.ol_list:
      return {
        type: "list",
        ordered: true,
        spread: false,
        children,
      };
      return `\n${children}\n`;

    case nodeTypes.listItem:
      return {
        type: "listItem",
        children,
      };
      const isOL = chunk && chunk.parentType === nodeTypes.ol_list;

      let spacer = "";
      for (let k = 0; listDepth > k; k++) {
        if (isOL) {
          // https://github.com/remarkjs/remark-react/issues/65
          spacer += "   ";
        } else {
          spacer += "  ";
        }
      }
      return `${spacer}${isOL ? "1." : "-"} ${children}`;

    case nodeTypes.paragraph:
      return {
        type: "paragraph",
        children,
      };
      return `${children}\n`;

    case nodeTypes.thematic_break:
      return {
        type: "thematicBreak",
      };
      return `---\n`;

    default:
      return children;
  }
}

// This function handles the case of a string like this: "   foo   "
// Where it would be invalid markdown to generate this: "**   foo   **"
// We instead, want to trim the whitespace out, apply formatting, and then
// bring the whitespace back. So our returned string looks like this: "   **foo**   "
function retainWhitespaceAndFormat(item: Content[], formats: string[]) {
  // we keep this for a comparison later
  const frozenString = string.trim();

  // children will be mutated
  let children = item;
  formats.forEach((format) => {});

  // We reverse the right side formatting, to properly handle bold/italic and strikeThrough
  // formats, so we can create ~~***FooBar***~~
  const fullFormat = `${format}${children}${reverseStr(format)}`;

  // This conditions accounts for no whitespace in our string
  // if we don't have any, we can return early.
  if (children.length === string.length) {
    return fullFormat;
  }

  // if we do have whitespace, let's add our formatting around our trimmed string
  // We reverse the right side formatting, to properly handle bold/italic and strikeThrough
  // formats, so we can create ~~***FooBar***~~
  const formattedString = format + children + reverseStr(format);

  // and replace the non-whitespace content of the string
  return string.replace(frozenString, formattedString);
}

const reverseStr = (string: string) => string.split("").reverse().join("");
