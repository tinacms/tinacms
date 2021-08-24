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

import { deserialize } from "../components/post";
import { Form, MdxField } from "tinacms";
const Editor = (props) => {
  const templates = props.field.templates;
  const editor = useMemo(() => withReact(createEditor()), []);
  const [value, setValue] = useState([]);

  useEffect(() => {
    const run = async () => {
      if (props.input.value) {
        setValue(deserialize(props.input.value));
      }
    };
    run();
  }, []);

  // useEffect(() => {
  //   if (value.length) {
  //     const val = value.map((v) => serialize(v)).join("");
  //     props.input.onChange(val);
  //   }
  //   // FIXME Setting onChange as a dependency causes 2 calls,
  //   // presumbably because onChange is getting a
  //   // new identity on each keystroke
  // }, [value]);

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
    return element.type === "mdxJsxTextElement" ? true : false;
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
          // value={value}
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

const CodeElement = (props) => {
  return (
    <pre {...props.attributes}>
      <code>{props.children}</code>
    </pre>
  );
};

const DefaultElement = (props) => {
  return <p {...props.attributes}>{props.children}</p>;
};

const MdxPicker = (props) => {
  const activeTemplate = props.templates.find(
    (template) => template.name === props.element.node.name
  );
  console.log(props);
  const initialValues = {};
  props.element.node.attributes.forEach((att) => {
    initialValues[att.name] = att.value;
  });
  const form = new Form({
    id: "some-label",
    label: "Label",
    initialValues,
    onSubmit: (values) => {
      console.log("my form", values);
    },
    fields: activeTemplate.fields,
  });
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
