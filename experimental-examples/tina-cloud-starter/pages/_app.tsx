import "../styles.css";
import dynamic from "next/dynamic";
import { TinaEditProvider } from "tinacms/dist/edit-state";
import { Layout } from "../components/layout";
// @ts-ignore FIXME: default export needs to be 'ComponentType<{}>
const TinaCMS = dynamic(() => import("tinacms"), { ssr: false });

const App = ({ Component, pageProps }) => {
  return (
    <>
      <TinaEditProvider
        showEditButton={true}
        editMode={
          <TinaCMS
            apiURL={process.env.NEXT_PUBLIC_TINA_API_URL}
            mediaStore={async () => {
              const pack = await import("next-tinacms-cloudinary");
              return pack.TinaCloudCloudinaryMediaStore;
            }}
            cmsCallback={(cms) => {
              /**
               * Flags
               */
              /**
               * Enables the Tina Admin Experience
               */
              cms.flags.set("tina-admin", true);
              /**
               * Enables the Branch Switcher
               */
              cms.flags.set("branch-switcher", true);
              cms.flags.set("use-unstable-formify", true);

              /**
               * Plugins
               */
              import("tinacms").then(({ RouteMappingPlugin }) => {
                const RouteMapping = new RouteMappingPlugin(
                  (collection, document) => {
                    if (["authors", "global"].includes(collection.name)) {
                      return undefined;
                    }
                    if (["pages"].includes(collection.name)) {
                      if (document.sys.filename === "home") {
                        return `/`;
                      }
                      if (document.sys.filename === "about") {
                        return `/about`;
                      }
                      return undefined;
                    }
                    return `/${collection.name}/${document.sys.filename}`;
                  }
                );
                cms.plugins.add(RouteMapping);
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
              if (formConfig.id === "content/global/index.json") {
                //@ts-ignore
                return createGlobalForm(formConfig, { layout: "fullscreen" });
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
