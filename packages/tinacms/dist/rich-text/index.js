(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? factory(exports, require("react")) : typeof define === "function" && define.amd ? define(["exports", "react"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global.tinacms = {}, global.NOOP));
})(this, function(exports2, React) {
  "use strict";
  const TinaMarkdown = ({
    content,
    components = {}
  }) => {
    if (!content) {
      return null;
    }
    const nodes = Array.isArray(content) ? content : content.children;
    if (!nodes) {
      return null;
    }
    return /* @__PURE__ */ React.createElement(React.Fragment, null, nodes.map((child, index) => {
      return /* @__PURE__ */ React.createElement(MemoNode, { components, key: index, child });
    }));
  };
  const Leaf = (props) => {
    if (props.bold) {
      const { bold, ...rest } = props;
      if (props.components.bold) {
        const Component = props.components.bold;
        return /* @__PURE__ */ React.createElement(Component, null, /* @__PURE__ */ React.createElement(Leaf, { ...rest }));
      }
      return /* @__PURE__ */ React.createElement("strong", null, /* @__PURE__ */ React.createElement(Leaf, { ...rest }));
    }
    if (props.italic) {
      const { italic, ...rest } = props;
      if (props.components.italic) {
        const Component = props.components.italic;
        return /* @__PURE__ */ React.createElement(Component, null, /* @__PURE__ */ React.createElement(Leaf, { ...rest }));
      }
      return /* @__PURE__ */ React.createElement("em", null, /* @__PURE__ */ React.createElement(Leaf, { ...rest }));
    }
    if (props.underline) {
      const { underline, ...rest } = props;
      if (props.components.underline) {
        const Component = props.components.underline;
        return /* @__PURE__ */ React.createElement(Component, null, /* @__PURE__ */ React.createElement(Leaf, { ...rest }));
      }
      return /* @__PURE__ */ React.createElement("u", null, /* @__PURE__ */ React.createElement(Leaf, { ...rest }));
    }
    if (props.strikethrough) {
      const { strikethrough, ...rest } = props;
      if (props.components.strikethrough) {
        const Component = props.components.strikethrough;
        return /* @__PURE__ */ React.createElement(Component, null, /* @__PURE__ */ React.createElement(Leaf, { ...rest }));
      }
      return /* @__PURE__ */ React.createElement("s", null, /* @__PURE__ */ React.createElement(Leaf, { ...rest }));
    }
    if (props.code) {
      const { code, ...rest } = props;
      if (props.components.code) {
        const Component = props.components.code;
        return /* @__PURE__ */ React.createElement(Component, null, /* @__PURE__ */ React.createElement(Leaf, { ...rest }));
      }
      return /* @__PURE__ */ React.createElement("code", null, /* @__PURE__ */ React.createElement(Leaf, { ...rest }));
    }
    if (props.components.text) {
      const Component = props.components.text;
      return /* @__PURE__ */ React.createElement(Component, null, props.text);
    }
    return /* @__PURE__ */ React.createElement(React.Fragment, null, props.text);
  };
  const MemoNode = (props) => {
    const MNode = React.useMemo(
      () => /* @__PURE__ */ React.createElement(Node, { ...props }),
      [JSON.stringify(props)]
    );
    return MNode;
  };
  const Node = ({ components, child }) => {
    var _a, _b, _c, _d, _e, _f, _g;
    const { children, ...props } = child;
    switch (child.type) {
      case "h1":
      case "h2":
      case "h3":
      case "h4":
      case "h5":
      case "h6":
      case "p":
      case "blockquote":
      case "ol":
      case "ul":
      case "li":
        if (components[child.type]) {
          const Component2 = components[child.type];
          return /* @__PURE__ */ React.createElement(Component2, { ...props }, /* @__PURE__ */ React.createElement(TinaMarkdown, { components, content: children }));
        }
        return React.createElement(child.type, {
          children: /* @__PURE__ */ React.createElement(TinaMarkdown, { components, content: children })
        });
      case "lic":
        if (components.lic) {
          const Component2 = components.lic;
          return /* @__PURE__ */ React.createElement(Component2, { ...props }, /* @__PURE__ */ React.createElement(TinaMarkdown, { components, content: children }));
        }
        return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(TinaMarkdown, { components, content: child.children }));
      case "img":
        if (components[child.type]) {
          const Component2 = components[child.type];
          return /* @__PURE__ */ React.createElement(Component2, { ...props });
        }
        return /* @__PURE__ */ React.createElement("img", { src: child.url, alt: child.alt });
      case "a":
        if (components[child.type]) {
          const Component2 = components[child.type];
          return (
            // @ts-ignore FIXME: TinaMarkdownContent needs to be a union of all possible node types
            /* @__PURE__ */ React.createElement(Component2, { ...props }, /* @__PURE__ */ React.createElement(TinaMarkdown, { components, content: children }))
          );
        }
        return (
          // @ts-ignore FIXME: TinaMarkdownContent needs to be a union of all possible node types
          /* @__PURE__ */ React.createElement("a", { href: child.url }, /* @__PURE__ */ React.createElement(TinaMarkdown, { components, content: children }))
        );
      case "mermaid":
      case "code_block": {
        const value = child.value;
        if (components[child.type]) {
          const Component2 = components[child.type];
          return (
            // @ts-ignore FIXME: TinaMarkdownContent needs to be a union of all possible node types
            /* @__PURE__ */ React.createElement(Component2, { ...props })
          );
        }
        return /* @__PURE__ */ React.createElement("pre", null, /* @__PURE__ */ React.createElement("code", null, value));
      }
      case "hr":
        if (components[child.type]) {
          const Component2 = components[child.type];
          return /* @__PURE__ */ React.createElement(Component2, { ...props });
        }
        return /* @__PURE__ */ React.createElement("hr", null);
      case "break":
        if (components[child.type]) {
          const Component2 = components[child.type];
          return /* @__PURE__ */ React.createElement(Component2, { ...props });
        }
        return /* @__PURE__ */ React.createElement("br", null);
      case "text":
        return /* @__PURE__ */ React.createElement(Leaf, { components, ...child });
      case "mdxJsxTextElement":
      case "mdxJsxFlowElement":
        const Component = components[child.name];
        if (Component) {
          const props2 = child.props ? child.props : {};
          return /* @__PURE__ */ React.createElement(Component, { ...props2 });
        } else {
          if (child.name === "table") {
            const firstRowHeader = (_a = child.props) == null ? void 0 : _a.firstRowHeader;
            const rows2 = (firstRowHeader ? (_b = child.props) == null ? void 0 : _b.tableRows.filter((_, i) => i !== 0) : (_c = child.props) == null ? void 0 : _c.tableRows) || [];
            const header = (_e = (_d = child.props) == null ? void 0 : _d.tableRows) == null ? void 0 : _e.at(0);
            const TableComponent2 = components["table"] || ((props2) => /* @__PURE__ */ React.createElement("table", { ...props2 }));
            const TrComponent2 = components["tr"] || ((props2) => /* @__PURE__ */ React.createElement("tr", { ...props2 }));
            const ThComponent = components["th"] || ((props2) => /* @__PURE__ */ React.createElement("th", { style: { textAlign: (props2 == null ? void 0 : props2.align) || "auto" }, ...props2 }));
            const TdComponent2 = components["td"] || ((props2) => /* @__PURE__ */ React.createElement("td", { style: { textAlign: (props2 == null ? void 0 : props2.align) || "auto" }, ...props2 }));
            const align2 = ((_f = child.props) == null ? void 0 : _f.align) || [];
            return /* @__PURE__ */ React.createElement(TableComponent2, null, firstRowHeader && /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement(TrComponent2, null, header.tableCells.map((c, i) => {
              return /* @__PURE__ */ React.createElement(
                TinaMarkdown,
                {
                  key: i,
                  components: {
                    p: (props2) => /* @__PURE__ */ React.createElement(ThComponent, { align: align2[i], ...props2 })
                  },
                  content: c.value
                }
              );
            }))), /* @__PURE__ */ React.createElement("tbody", null, rows2.map((row, i) => {
              var _a2;
              return /* @__PURE__ */ React.createElement(TrComponent2, { key: i }, (_a2 = row == null ? void 0 : row.tableCells) == null ? void 0 : _a2.map((c, i2) => {
                return /* @__PURE__ */ React.createElement(
                  TinaMarkdown,
                  {
                    key: i2,
                    components: {
                      p: (props2) => /* @__PURE__ */ React.createElement(TdComponent2, { align: align2[i2], ...props2 })
                    },
                    content: c.value
                  }
                );
              }));
            })));
          }
          const ComponentMissing = components["component_missing"];
          if (ComponentMissing) {
            return /* @__PURE__ */ React.createElement(ComponentMissing, { name: child.name });
          } else {
            return /* @__PURE__ */ React.createElement("span", null, `No component provided for ${child.name}`);
          }
        }
      case "table":
        const rows = child.children || [];
        const TableComponent = components["table"] || ((props2) => /* @__PURE__ */ React.createElement("table", { style: { border: "1px solid #EDECF3" }, ...props2 }));
        const TrComponent = components["tr"] || ((props2) => /* @__PURE__ */ React.createElement("tr", { ...props2 }));
        const TdComponent = components["td"] || ((props2) => /* @__PURE__ */ React.createElement(
          "td",
          {
            style: {
              textAlign: (props2 == null ? void 0 : props2.align) || "auto",
              border: "1px solid #EDECF3",
              padding: "0.25rem"
            },
            ...props2
          }
        ));
        const align = ((_g = child.props) == null ? void 0 : _g.align) || [];
        return /* @__PURE__ */ React.createElement(TableComponent, null, /* @__PURE__ */ React.createElement("tbody", null, rows.map((row, i) => {
          var _a2;
          return /* @__PURE__ */ React.createElement(TrComponent, { key: i }, (_a2 = row.children) == null ? void 0 : _a2.map((cell, i2) => {
            return /* @__PURE__ */ React.createElement(
              TinaMarkdown,
              {
                key: i2,
                components: {
                  p: (props2) => /* @__PURE__ */ React.createElement(TdComponent, { align: align[i2], ...props2 })
                },
                content: cell.children
              }
            );
          }));
        })));
      case "maybe_mdx":
        return null;
      case "html":
      case "html_inline":
        if (components[child.type]) {
          const Component2 = components[child.type];
          return /* @__PURE__ */ React.createElement(Component2, { ...props });
        }
        return child.value;
      case "invalid_markdown":
        return /* @__PURE__ */ React.createElement("pre", null, child.value);
      default:
        if (typeof child.text === "string") {
          return /* @__PURE__ */ React.createElement(Leaf, { components, ...child });
        }
    }
  };
  exports2.TinaMarkdown = TinaMarkdown;
  Object.defineProperty(exports2, Symbol.toStringTag, { value: "Module" });
});
