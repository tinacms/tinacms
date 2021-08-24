import "../styles.css";
import dynamic from "next/dynamic";
import { TinaEditProvider } from "tinacms/dist/edit-state";
import { Layout } from "../components/layout";
const TinaCMS = dynamic(() => import("tinacms"), { ssr: false });
import { TinaCloudCloudinaryMediaStore } from "next-tinacms-cloudinary";

import React, { useEffect, useCallback, useMemo, useState } from "react";
import { createEditor } from "slate";
import { Slate, Editable, withReact } from "slate-react";

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
                name: "markdown",
                Component: Editor,
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

import { deserialize, serialize } from "../components/post";
import { Form, MdxField } from "tinacms";
const Editor2 = (props) => {
  const [value, setValue] = React.useState(props.input?.value?.type);
  React.useEffect(() => {
    console.log("i mounted", props.input.value);
    props.input.onChange(value);
  }, [value]);
  return (
    <input
      type="text"
      {...props.input}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
};
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

  const renderElement = useCallback((props) => {
    switch (props.element.type) {
      case "code":
        return <CodeElement {...props} />;
      case "mdxJsxTextElement":
        return <MdxPicker inline={true} {...props} templates={templates} />;
      case "mdxJsxFlowElement":
        return <MdxPicker {...props} templates={templates} />;
        return <div>Render Tina Form Here!</div>;
      default:
        return <DefaultElement {...props} />;
    }
  }, []);

  editor.isVoid = (element) => {
    return element.type === "mdxJsxFlowElement" ? true : false;
  };
  editor.isInline = (element) => {
    return ["mdxJsxTextElement", "link"].includes(element.type);
  };
  return (
    <>
      <label style={{ fontWeight: 600, fontSize: "13px", marginBottom: "6px" }}>
        {props.field.label}
      </label>
      <div
        style={{
          padding: "10px",
          marginBottom: "18px",
          background: "white",
          borderRadius: "4px",
          border: "1px solid #efefef",
        }}
      >
        <Slate
          editor={editor}
          value={value}
          onChange={(newValue) => {
            setReady(true);
            setValue(newValue);
          }}
        >
          <Editable renderElement={renderElement} />
        </Slate>
      </div>
    </>
  );
};

const CodeElement = (props) => {
  return (
    <pre {...props.attributes}>
      <code>{props.children}</code>
    </pre>
  );
};

const DefaultElement = (props) => {
  if (["mdxJsxTextElement", "link"].includes(props.element.type)) {
    return <span {...props.attributes}>{props.children}</span>;
  }
  return <p {...props.attributes}>{props.children}</p>;
};

const MdxPicker = (props) => {
  const activeTemplate = props.templates.find(
    (template) => template.name === props.element.node.name
  );
  const initialValues = {};
  props.element.node.attributes.forEach((att) => {
    initialValues[att.name] = att.value;
  });
  const form = new Form({
    id: props.element.node.name,
    label: props.element.node.name,
    initialValues,
    onSubmit: (values) => {
      const atts = [];
      Object.entries(values).forEach(([name, value]) => {
        atts.push({ type: "mdxJsxAttribute", name, value });
      });
      props.element.node.attributes = atts;
    },
    fields: activeTemplate.fields,
  });
  // form.subscribe((values) => {
  //   console.log('gotem ',values)
  // }, {values: true})
  return (
    <span {...props.attributes} contentEditable={false}>
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
    </span>
  );
};
