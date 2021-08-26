import "../styles.css";
import dynamic from "next/dynamic";
import { TinaEditProvider } from "tinacms/dist/edit-state";
import { Layout } from "../components/layout";
const TinaCMS = dynamic(() => import("tinacms"), { ssr: false });
import { TinaCloudCloudinaryMediaStore } from "next-tinacms-cloudinary";
import { deserialize, NodeValueTypes } from "../components/post";
import { Form, MdxField, PopupAdder } from "tinacms";

import React, { useEffect, useCallback, useMemo, useState } from "react";
import { createEditor, Transforms, Location, BaseRange } from "slate";
import { Slate, Editable, withReact, useSlate } from "slate-react";

const NEXT_PUBLIC_TINA_CLIENT_ID = process.env.NEXT_PUBLIC_TINA_CLIENT_ID;
const NEXT_PUBLIC_USE_LOCAL_CLIENT =
  process.env.NEXT_PUBLIC_USE_LOCAL_CLIENT || true;

const App = ({ Component, pageProps }) => {
  return (
    <>
      <TinaEditProvider
        showEditButton={true}
        editMode={
          <TinaCMS
            branch="main"
            clientId={NEXT_PUBLIC_TINA_CLIENT_ID}
            isLocalClient={Boolean(Number(NEXT_PUBLIC_USE_LOCAL_CLIENT))}
            mediaStore={TinaCloudCloudinaryMediaStore}
            cmsCallback={(cms) => {
              cms.fields.add({
                name: "rich-text",
                Component: Editor,
              });
              import("react-tinacms-editor").then(({ MarkdownFieldPlugin }) => {
                cms.plugins.add(MarkdownFieldPlugin);
              });
            }}
            documentCreatorCallback={{
              /**
               * After a new document is created, redirect to its location
               */
              onNewDocument: ({ collection: { slug }, breadcrumbs }) => {
                const relativeUrl = `/${slug}/${breadcrumbs.join("/")}`;
                return (window.location.href = relativeUrl);
              },
              /**
               * Only allows documents to be created to the `Blog Posts` Collection
               */
              filterCollections: (options) => {
                return options.filter(
                  (option) => option.label === "Blog Posts"
                );
              },
            }}
            formifyCallback={({ formConfig, createForm, createGlobalForm }) => {
              if (formConfig.id === "getGlobalDocument") {
                return createGlobalForm(formConfig);
              }

              return createForm(formConfig);
            }}
            {...pageProps}
          >
            {(livePageProps) => (
              <Layout
                rawData={livePageProps}
                data={livePageProps.data?.getGlobalDocument?.data}
              >
                <Component {...livePageProps} />
              </Layout>
            )}
          </TinaCMS>
        }
      >
        <Layout
          rawData={pageProps}
          data={pageProps.data?.getGlobalDocument?.data}
        >
          <Component {...pageProps} />
        </Layout>
      </TinaEditProvider>
    </>
  );
};

export default App;

const Editor = (props) => {
  const InnerEditor = useMemo(() => <EditorInner {...props} />, []);
  return InnerEditor;
};
const EditorInner = (props) => {
  const templates = props.field.templates;
  const editor = useMemo(() => withReact(createEditor()), []);
  const [value, setValue] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (props.input.value) {
      setValue(deserialize(props.input.value));
    }
  }, [JSON.stringify(props.input.value)]);

  useEffect(() => {
    if (value.length > 0 && ready) {
      props.input.onChange(value);
    }
  }, [JSON.stringify(value)]);
  const [voidSelection, setVoidSelection] = React.useState<BaseRange>(null);
  const [popupSelection, setPopupSelection] = React.useState<BaseRange>(null);
  const focusSelection = popupSelection
    ? popupSelection.focus
    : editor.selection?.focus;

  const renderElement = useCallback(
    (props) => {
      const type = props.element.type as keyof NodeValueTypes;
      switch (type) {
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
            <a {...props.attributes} href={props.element.link}>
              {props.children}
            </a>
          );
        case "mdxJsxFlowElement":
        case "mdxJsxTextElement":
          return (
            <span
              {...props.attributes}
              onClick={() => {
                // Clicking futher down in this node propagates
                // and since `void` elements reset the editor selection
                // multiple clicks result in this being nullified
                if (!voidSelection) {
                  setVoidSelection(editor.selection);
                }
              }}
              contentEditable={false}
            >
              <MdxPicker
                inline={props.element.type === "mdxJsxTextElement"}
                {...props}
                templates={templates}
                onChange={(value) => {
                  const v = {
                    ...props.element,
                    node: {
                      ...props.element.node,
                      attributes: value,
                    },
                  };
                  Transforms.setNodes(editor, v, {
                    at: voidSelection.focus,
                  });
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
    return element.type === "mdxJsxFlowElement" ? true : false;
  };
  editor.isInline = (element) => {
    return ["mdxJsxTextElement", "link"].includes(element.type);
  };
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <label
          style={{ fontWeight: 600, fontSize: "13px", marginBottom: "6px" }}
        >
          {props.field.label}
        </label>
        <PopupAdder
          showButton={focusSelection}
          onAdd={(template) => {
            const meh = {
              type: "mdxJsxFlowElement",
              node: {
                type: "mdxJsxFlowElement",
                name: template.name,
                // TODO: put default items here
                attributes: {
                  // label: "Click heredd",
                  // to: "https://example.com",
                  // nested: ["ok", "okok"],
                  // nestedObject: {
                  //   ok: "yes",
                  // },
                },
                children: [],
                ordered: false,
              },
              children: [
                {
                  text: "",
                },
              ],
            };
            Transforms.setNodes(editor, meh, {
              at: popupSelection
                ? popupSelection.focus
                : editor.selection.focus,
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
            setReady(true);
            setValue(newValue);
          }}
        >
          <Editable
            renderElement={renderElement}
            onKeyDown={(event) => {
              switch (event.key) {
                case "<": {
                  setPopupSelection(editor.selection);
                  break;
                }
                default:
                  setPopupSelection(null);
              }
            }}
          />
        </Slate>
      </div>
    </>
  );
};

const MdxPicker = (props) => {
  const activeTemplate = props.templates.find(
    (template) => template.name === props.element.node.name
  );
  const initialValues = props.element.node.attributes;
  const form = new Form({
    id: props.element.node.name,
    label: props.element.node.name,
    initialValues,
    onSubmit: (values) => {
      props.onChange(values);
    },
    fields: activeTemplate.fields,
  });
  return (
    <>
      {props.children}
      <MdxField
        inline={props.inline}
        tinaForm={form}
        form={form.finalForm}
        field={activeTemplate}
        input={{
          name: "",
          onChange: (value) => {
            console.log("changed", value);
          },
        }}
        meta={{}}
      />
    </>
  );
};
