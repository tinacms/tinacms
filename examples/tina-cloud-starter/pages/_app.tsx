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
            <EditMode Component={Component} pageProps={pageProps} />
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
