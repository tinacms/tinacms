import { defineStaticConfig } from "tinacms";
import { schema } from "./schema";

export default defineStaticConfig({
  branch: null,
  clientId: null,
  token: null,
  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },
  // tinaioConfig: {
  //   contentApiUrlOverride: "foo.io",
  // },
  media: {
    tina: {
      publicFolder: "public",
      mediaRoot: "",
    },
  },
  schema,
  cmsCallback: (cms) => {
    /**
     * Enables experimental branch switcher
     */
    cms.flags.set("branch-switcher", true);

    return cms;
  },
});
