import { defineConfig, defineLegacyConfig } from "tinacms";
import schema from "./schema";
import client from "./__generated__/client";

export default defineLegacyConfig({
  // Uncomment to enable standalone/iframe-mode
  // build: {
  //   outputFolder: "tina",
  //   publicFolder: "public",
  // },
  // tinaioConfig: {
  //   contentApiUrlOverride: "foo.io",
  // },
  branch: "main",
  clientId: "foobar",
  token: "foo",
  media: {
    // Media store config example
    // loadCustomStore: async () => {
    //   const pack = await import("next-tinacms-cloudinary");
    //   return pack.TinaCloudCloudinaryMediaStore;
    // },
    tina: {
      publicFolder: "public",
      mediaRoot: "",
    },
  },
  client,
  schema,
  cmsCallback: (cms) => {
    /**
     * Enables experimental branch switcher
     */
    cms.flags.set("branch-switcher", true);

    return cms;
  },
});
