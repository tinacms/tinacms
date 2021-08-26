import { Form, MdxField, PopupAdder } from "tinacms";
import React, { useCallback } from "react";
import { createEditor, Transforms, BaseRange } from "slate";
import { Slate, Editable, withReact } from "slate-react";
import type { BaseEditor } from "slate";
import type { RenderElementProps, ReactEditor } from "slate-react";
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
  const [value, setValue] = React.useState(props.input.value);
  const [voidSelection, setVoidSelection] = React.useState<BaseRange>(null);
  const templates = props.field.templates;

  React.useEffect(() => {
    props.input.onChange(value);
  }, [JSON.stringify(value)]);

  const renderElement = useCallback(
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
        case "mdxJsxFlowElement":
          return (
            <span
              {...props.attributes}
              onClick={() => {
                // Clicking futher down in this node propagates
                // and since `void` elements reset the editor selection
                // to (0, 0) we need to track the void's location
                if (!voidSelection) {
                  setVoidSelection(editor.selection);
                }
              }}
              contentEditable={false}
            >
              <MdxPicker
                inline={element.type === "mdxJsxTextElement"}
                {...props}
                templates={templates}
                isReady={!!voidSelection}
                onChange={(value) => {
                  const v = {
                    ...props.element,
                    attributes: value,
                  };
                  // Works for block nodes, not for inline
                  Transforms.setNodes(editor, v, {
                    at: voidSelection.focus,
                  });
                }}
                onSubmit={() => {
                  setVoidSelection(null);
                }}
              />
            </span>
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
            Transforms.insertNodes(editor, {
              type: "mdxJsxFlowElement",
              name: template.name,
              attributes: template.defaultItem,
              ordered: false,
              children: [
                {
                  type: "text",
                  text: "",
                },
              ],
            });
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
  const initialValues = props.element.attributes;
  const activeTemplate = props.templates.find(
    (template) => template.name === props.element.name
  );
  const form = new Form({
    id: props.element.name,
    label: props.element.name,
    initialValues,
    onSubmit: (values) => {
      props.onChange(values);
    },
    fields: activeTemplate ? activeTemplate.fields : [],
  });
  // FIXME: infinite loop
  // form.subscribe(
  //   ({ values }) => {
  //     // props.onChange(values);
  //   },
  //   { values: true }
  // );

  return (
    <span ref={ref}>
      {props.children}
      <MdxField inline={props.inline} tinaForm={form} field={activeTemplate} />
    </span>
  );
};
