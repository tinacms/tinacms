import "../styles.css";
import dynamic from "next/dynamic";
import { TinaEditProvider } from "tinacms/dist/edit-state";
import { Layout } from "../components/layout";
// @ts-ignore
const TinaCMS = dynamic(() => import("tinacms"), { ssr: false });
import { GroupListFieldPlugin } from "tinacms";
import React from "react";

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
            mediaStore={import("next-tinacms-cloudinary").then(
              ({ TinaCloudCloudinaryMediaStore }) =>
                TinaCloudCloudinaryMediaStore
            )}
            cmsCallback={(cms) => {
              cms.sidebar.isOpen = true;
              import("react-tinacms-editor").then(({ MarkdownFieldPlugin }) => {
                cms.plugins.add(MarkdownFieldPlugin);
              });
              console.log({ GroupListFieldPlugin });
              cms.fields.add({
                ...GroupListFieldPlugin, // spread existing group-list plugin
                name: "MyGroupList",
                itemProps: (item) => {
                  console.log(item);
                  return {
                    key: item.title, // ensure this is unique
                    label: item.title, // item will be the field values, so if you have a `name` field, you can use that as the label
                  };
                },
              });
              // import("tinacms").then(({ GroupListFieldPlugin }) => {
              //   console.log("doit", GroupListFieldPlugin);

              // });
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
