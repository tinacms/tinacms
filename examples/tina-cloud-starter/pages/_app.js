import "../styles.css";
import { useState } from "react";
import dynamic from "next/dynamic";
import { TinaEditProvider } from "tinacms/dist/edit-state";
import { Layout } from "../components/layout";
import { BranchSwitcherPlugin } from "../plugins/branch-switcher";
const TinaCMS = dynamic(() => import("tinacms"), { ssr: false });

const NEXT_PUBLIC_TINA_CLIENT_ID = process.env.NEXT_PUBLIC_TINA_CLIENT_ID;
const NEXT_PUBLIC_USE_LOCAL_CLIENT =
  process.env.NEXT_PUBLIC_USE_LOCAL_CLIENT || true;

const App = ({ Component, pageProps }) => {
  const [currentBranch, setCurrentBranch] = useState("main");
  return (
    <>
      <TinaEditProvider
        showEditButton={true}
        editMode={
          <TinaCMS
            branch={currentBranch}
            clientId={NEXT_PUBLIC_TINA_CLIENT_ID}
            isLocalClient={Boolean(Number(NEXT_PUBLIC_USE_LOCAL_CLIENT))}
            mediaStore={import("next-tinacms-cloudinary").then(
              ({ TinaCloudCloudinaryMediaStore }) =>
                TinaCloudCloudinaryMediaStore
            )}
            cmsCallback={(cms) => {
              import("react-tinacms-editor").then(({ MarkdownFieldPlugin }) => {
                cms.plugins.add(MarkdownFieldPlugin);
              });
              cms.plugins.add(BranchSwitcherPlugin);
              cms.events.subscribe("content-source-change", ({ branch }) => {
                console.log(`ready to switch branch to ${branch}`);
                setCurrentBranch(branch);
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
