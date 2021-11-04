import "../styles.css";
import dynamic from "next/dynamic";
import { TinaEditProvider } from "tinacms/dist/edit-state";
import { Layout } from "../components/layout";
import {
  TinaCMS,
  TinaProvider,
  Client,
  LocalClient,
  useCloudForms,
  useCMS,
  GlobalFormPlugin,
  Form,
  TinaCloudProvider as TinaCloudAuthProvider,
  TinaCloudQuery,
} from "tinacms";
import { useEffect, useMemo } from "react";
// @ts-ignore FIXME: default export needs to be 'ComponentType<{}>

const NEXT_PUBLIC_TINA_CLIENT_ID = process.env.NEXT_PUBLIC_TINA_CLIENT_ID;
const NEXT_PUBLIC_USE_LOCAL_CLIENT =
  process.env.NEXT_PUBLIC_USE_LOCAL_CLIENT || true;

const TinaForms = ({ forms }: { forms: Form[] }) => {
  const cms = useCMS();

  // Register some custom plugins like so:
  useEffect(() => {
    import("react-tinacms-editor").then(({ MarkdownFieldPlugin }) => {
      cms.plugins.add(MarkdownFieldPlugin);
    });
  }, []);

  // You could register a custom form here like so:

  // useEffect(() => {
  //   cms.forms.add(
  //     new Form({
  //       id: "cool-form",
  //       label: "Edit Post",
  //       fields: [
  //         {
  //           name: "title",
  //           label: "Title",
  //           component: "text",
  //         },
  //         {
  //           name: "markdownContent",
  //           label: "content",
  //           component: "markdown",
  //         },
  //       ],
  //       initialValues: {
  //         title: "Default value",
  //         markdownContent: "",
  //       },
  //       onSubmit: async (formData) => {
  //         alert("You saved a dummy form");
  //       },
  //     })
  //   );
  // }, []);

  // register the forms that came from Tina Cloud
  useEffect(() => {
    forms.forEach((form) => {
      if (form.id === "getGlobalDocument") {
        cms.plugins.add(new GlobalFormPlugin(form));
      } else {
        cms.forms.add(form);
      }
    });
  }, [forms]);

  return <div />;
};

const App = ({ Component, pageProps }) => {
  const cms = useMemo(
    () =>
      new TinaCMS({
        enabled: true,
        sidebar: true,
        apis: {
          // Register the local or production Tina Cloud backend
          tina:
            process.env.NODE_ENV == "production"
              ? new Client({ branch: "main", clientId: "" })
              : new LocalClient(),
        },
      })
  );
  return (
    <>
      <TinaEditProvider
        showEditButton={true}
        editMode={
          <TinaProvider cms={cms}>
            {/* Container to maoe sure user is logged in */}
            <TinaCloudAuthProvider>
              <TinaCloudQuery
                query={pageProps.query}
                variables={pageProps.variables}
              >
                {({ forms, data }) => (
                  <>
                    {/* Custom component to register our forms */}
                    <TinaForms forms={forms} />
                    {/* Preview the content */}
                    <Layout rawData={data} data={data?.getGlobalDocument?.data}>
                      <Component data={data} />
                    </Layout>
                  </>
                )}
              </TinaCloudQuery>
            </TinaCloudAuthProvider>
          </TinaProvider>
        }
      >
        {/* Production page */}
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
