import { defineConfig } from "tinacms";
import schema from "./schema";
import client from "./__generated__/client";

export default defineConfig({
  build: {
    outputFolder: "tina",
    publicFolder: "public",
  },
  branch: "main",
  clientId: "foobar",
  token: "foo",
  media: {
    // If you wanted cloudinary do this
    // loadCustomStore: async () => {
    //   const pack = await import("next-tinacms-cloudinary");
    //   return pack.TinaCloudCloudinaryMediaStore;
    // },
    // this is the config for the tina cloud media store
    tina: {
      publicFolder: "public",
      mediaRoot: "",
    },
  },
  client,
  schema,
  // Can add this back in if we want to use the cloudinary media store
  // mediaStore: async () => {
  //   const pack = await import("next-tinacms-cloudinary");
  //   return pack.TinaCloudCloudinaryMediaStore;
  // },
  cmsCallback: (cms) => {
    /**
     * Enables experimental branch switcher
     */
    cms.flags.set("branch-switcher", true);

    // cms.sidebar.position = "overlay";
    // cms.sidebar.defaultState = "closed";
    // cms.sidebar.renderNav = false;

    /**
     * When `tina-admin` is enabled, this plugin configures contextual editing for collections
     */
    import("tinacms").then(({ RouteMappingPlugin }) => {
      const RouteMapping = new RouteMappingPlugin((collection, document) => {
        if (["authors", "global"].includes(collection.name)) {
          return undefined;
        }
        if (["pages"].includes(collection.name)) {
          if (document._sys.filename === "home") {
            return `/`;
          }
          if (document._sys.filename === "about") {
            return `/about`;
          }
          return undefined;
        }
        return `/${collection.name}/${document._sys.filename}`;
      });
      cms.plugins.add(RouteMapping);
    });

    return cms;
  },
  formifyCallback: ({ formConfig, createForm, createGlobalForm }) => {
    if (formConfig.id === "content/global/index.json") {
      return createGlobalForm(formConfig);
    }

    return createForm(formConfig);
  },
});
