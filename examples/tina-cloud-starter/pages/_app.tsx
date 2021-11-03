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
  TinaCloudProvider,
} from "tinacms";
import { useEffect } from "react";
// @ts-ignore FIXME: default export needs to be 'ComponentType<{}>

const NEXT_PUBLIC_TINA_CLIENT_ID = process.env.NEXT_PUBLIC_TINA_CLIENT_ID;
const NEXT_PUBLIC_USE_LOCAL_CLIENT =
  process.env.NEXT_PUBLIC_USE_LOCAL_CLIENT || true;

const EditMode = ({ Component, pageProps }) => {
  const cms = useCMS();
  useEffect(() => {
    import("react-tinacms-editor").then(({ MarkdownFieldPlugin }) => {
      cms.plugins.add(MarkdownFieldPlugin);
    });
  });

  const {
    data,
    forms,
    isLoading: isLoadingForms,
  } = useCloudForms({
    query: pageProps.query,
    variables: pageProps.variables,
  });

  useEffect(() => {
    forms.forEach((form) => {
      if (form.id === "getGlobalDocument") {
        cms.plugins.add(new GlobalFormPlugin(form));
      } else {
        cms.forms.add(form);
      }
    });
  }, [isLoadingForms]);
  useEffect(() => {
    cms.forms.add(
      new Form({
        id: "cool-form",
        label: "Edit Post",
        fields: [
          {
            name: "title",
            label: "Title",
            component: "text",
          },
          {
            name: "markdownContent",
            label: "content",
            component: "markdown",
          },
        ],
        initialValues: {
          title: "Default value",
          markdownContent: "",
        },
        onSubmit: async (formData) => {
          alert("You saved a dummy form");
        },
      })
    );
  }, []);

  return (
    <Layout rawData={data} data={data?.getGlobalDocument?.data}>
      <Component data={data} />
    </Layout>
  );
};

const App = ({ Component, pageProps }) => {
  return (
    <>
      <TinaEditProvider
        showEditButton={true}
        editMode={
          <TinaProvider
            cms={
              new TinaCMS({
                enabled: true,
                sidebar: true,
                apis: {
                  tina:
                    process.env.NODE_ENV == "production"
                      ? new Client({ branch: "main", clientId: "" })
                      : new LocalClient(),
                },
              })
            }
          >
            <TinaCloudProvider>
              <EditMode Component={Component} pageProps={pageProps} />
            </TinaCloudProvider>
          </TinaProvider>
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
