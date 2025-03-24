import React, { Suspense } from "react";
import TinaCMS, {
  TinaAdmin,
  useCMS,
  MdxFieldPluginExtendible,
  useLocalStorage,
} from "tinacms";
import Playground from "./Playground";
import { Preview } from "./preview";

// @ts-expect-error
import schemaJson from "SCHEMA_IMPORT";
// @ts-expect-error
import staticMedia from "STATIC_MEDIA_IMPORT";
// TODO: Resolve this to local file in tsconfig.json
// @ts-expect-error
import config from "TINA_IMPORT";

const RawEditor = React.lazy(() => import("./fields/rich-text"));

const Editor = (props) => {
  const [rawMode, setRawMode] = React.useState(false);
  return (
    <MdxFieldPluginExtendible.Component
      rawMode={rawMode}
      setRawMode={setRawMode}
      {...props}
      rawEditor={
        <Suspense fallback={<div>Loading raw editor...</div>}>
          <RawEditor {...props} setRawMode={setRawMode} rawMode={rawMode} />
        </Suspense>
      }
    />
  );
};

const SetPreview = () => {
  const cms = useCMS();
  React.useEffect(() => {
    // Override original 'rich-text' field with one that has raw mode support
    cms.fields.add({
      ...MdxFieldPluginExtendible,
      Component: Editor,
    });
    const basePath = __BASE_PATH__.replace(/^\/|\/$/g, "");
    cms.flags.set("tina-basepath", basePath);
    cms.flags.set(
      "tina-preview",
      `${basePath ? `${basePath}/` : ""}${config.build.outputFolder.replace(
        /^\/|\/$/g,
        ""
      )}`
    );
  }, []);
  return null;
};

export const TinaAdminWrapper = () => {
  const schema = { ...config?.schema, config };
  return (
    // @ts-ignore JSX element type 'TinaCMS' does not have any construct or call signatures.ts(2604)
    <TinaCMS
      {...config}
      schema={schema}
      // TODO: This is being used when called on the server. This uses the at buildtime content api url. Which won't work when in a different branch
      client={{ apiUrl: __API_URL__ }}
      staticMedia={staticMedia}
      // THis will be replaced by the version of the graphql ackage or --garphql-version flag. It is replaced by vite at compile time
      tinaGraphQLVersion={__TINA_GRAPHQL_VERSION__}
    >
      <SetPreview />
      <TinaAdmin
        preview={Preview}
        Playground={Playground}
        config={config}
        schemaJson={schemaJson}
      />
    </TinaCMS>
  );
};

function App() {
  return <TinaAdminWrapper />;
}
export default App;
