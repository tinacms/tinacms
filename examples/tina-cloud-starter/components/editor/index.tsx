import React from "react";
import { Form, MdxField, PopupAdder } from "tinacms";
import { createEditor, Transforms, BaseRange, Element } from "slate";
import { Slate, Editable, withReact, ReactEditor } from "slate-react";
import type { BaseEditor } from "slate";
import type { RenderLeafProps, RenderElementProps } from "slate-react";
import type { SlateNodeType } from "./tina-markdown";

// https://docs.slatejs.org/concepts/12-typescript#defining-editor-element-and-text-types
// type CustomElement = { type: "paragraph"; children: CustomText[] };
// type CustomText = { text: string; bold?: true };
declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: SlateNodeType;
    // Text: CustomText;
  }
}

export const Editor = (props) => {
  // Hot reloads when usign useMemo to initialize https://github.com/ianstormtaylor/slate/issues/4081
  const [editor] = React.useState(withReact(createEditor()));
  const [value, setValue] = React.useState(
    props.input.value?.length > 0
      ? props.input.value
      : [{ type: "paragraph", children: [{ type: "text", text: "" }] }]
  );
  const [voidSelection, setVoidSelectionInner] =
    React.useState<BaseRange>(null);
  const setVoidSelection = (selection: BaseRange) => {
    setVoidSelectionInner(selection);
  };
  const templates = props.field.templates;

  React.useEffect(() => {
    props.input.onChange(value);
  }, [JSON.stringify(value)]);

  // const renderLeaf = React.useCallback((props: RenderLeafProps) => {
  //   return <span {...props.attributes}>{props.children}</span>;
  // }, []);

  const renderElement = React.useCallback(
    (props: RenderElementProps) => {
      const element = props.element;
      switch (element.type) {
        case "heading_one":
          return <h1 {...props.attributes}>{props.children}</h1>;
        case "heading_two":
          return <h2 {...props.attributes}>{props.children}</h2>;
        case "heading_three":
          return <h3 {...props.attributes}>{props.children}</h3>;
        case "heading_four":
          return <h4 {...props.attributes}>{props.children}</h4>;
        case "heading_five":
          return <h5 {...props.attributes}>{props.children}</h5>;
        case "heading_six":
          return <h6 {...props.attributes}>{props.children}</h6>;
        case "link":
          return (
            <a {...props.attributes} href={element.link}>
              {props.children}
            </a>
          );
        case "mdxJsxTextElement":
          return (
            <button {...props.attributes}>
              <span contentEditable={false}>
                <MdxPicker
                  inline={true}
                  {...props}
                  templates={templates}
                  isReady={!!voidSelection}
                  voidSelection={voidSelection}
                  onChange={(value, selection) => {
                    const newProperties: Partial<Element> = {
                      props: value,
                    };
                    Transforms.setNodes(editor, newProperties, {
                      /**
                       * match traverses the ancestors of the relevant node
                       * so matching on type works for this, but likely won't work
                       * on more complex nested mdxJsxTextElement nodes. I think
                       * we'll want to match the path to the selection path, but
                       * they're off by one:
                       * selection.focus.path => [0, 1, 0]
                       * and path is [0, 1]. I believe that's because the last
                       * 0 in the focus.path array is referring to the text node
                       */
                      match: (node, path) => {
                        // console.log(selection.focus);
                        // console.log(path, node.type);
                        if (node.type === "mdxJsxTextElement") {
                          return true;
                        }
                        return false;
                      },
                      at: selection,
                    });
                  }}
                />
              </span>
              {props.children}
            </button>
          );
        case "mdxJsxFlowElement":
          return (
            <button style={{ width: "100%" }} {...props.attributes}>
              <span contentEditable={false}>
                {/* <img src="http://placehold.it/300x200" /> */}
                <MdxPicker
                  inline={false}
                  {...props}
                  templates={templates}
                  isReady={!!voidSelection}
                  voidSelection={voidSelection}
                  onChange={(value, selection) => {
                    const newProperties: Partial<Element> = {
                      props: value,
                    };
                    Transforms.setNodes(editor, newProperties, {
                      at: selection,
                    });
                  }}
                />
              </span>
              {props.children}
            </button>
          );
        default:
          return <p {...props.attributes}>{props.children}</p>;
      }
    },
    [JSON.stringify(voidSelection)]
  );

  editor.isVoid = (element) => {
    switch (element.type) {
      case "mdxJsxFlowElement":
      case "mdxJsxTextElement":
        return true;
      default:
        return false;
    }
  };
  editor.isInline = (element) => {
    switch (element.type) {
      case "link":
      case "mdxJsxTextElement":
        return true;
      default:
        return false;
    }
  };
  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: "35px",
        }}
      >
        <label
          style={{ fontWeight: 600, fontSize: "13px", marginBottom: "6px" }}
        >
          {props.field.label}
        </label>
        <PopupAdder
          showButton={true}
          onAdd={(template) => {
            Transforms.insertNodes(editor, [
              {
                type: template.inline
                  ? "mdxJsxTextElement"
                  : "mdxJsxFlowElement",
                name: template.name,
                props: template.defaultItem,
                ordered: false,
                children: [
                  {
                    type: "text",
                    text: "",
                  },
                ],
              },
            ]);
          }}
          templates={templates}
        />
      </div>

      <div
        style={{
          padding: "10px",
          marginBottom: "18px",
          background: "white",
          borderRadius: "4px",
          border: "1px solid #efefef",
        }}
        className="slate-tina-field"
      >
        <style>{`.slate-tina-field [data-slate-node] {margin-bottom: 16px;}`}</style>
        <Slate
          editor={editor}
          value={value}
          onChange={(newValue) => {
            if (editor.selection) {
              setVoidSelection(editor.selection);
            }
            setValue(newValue);
          }}
        >
          <Editable renderElement={renderElement} />
        </Slate>
      </div>
    </>
  );
};

const MdxPicker = (props) => {
  const ref = React.useRef();
  const initialValues = props.element.props;
  const activeTemplate = props.templates.find(
    (template) => template.name === props.element.name
  );
  const id = props.element.name + Math.floor(Math.random() * 100);
  const form = React.useMemo(() => {
    return new Form({
      id,
      label: id,
      initialValues,
      onChange: ({ values }) => {
        props.onChange(values, props.voidSelection);
      },
      onSubmit: () => {},
      fields: activeTemplate ? activeTemplate.fields : [],
    });
  }, [JSON.stringify(props.voidSelection)]);

  return (
    <span ref={ref}>
      {props.children}
      <MdxField inline={props.inline} tinaForm={form} field={activeTemplate} />
    </span>
  );
};
