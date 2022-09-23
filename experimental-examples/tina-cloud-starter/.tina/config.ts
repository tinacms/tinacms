import { defineStaticConfig } from "tinacms";
import schema from "./schema";

export default defineStaticConfig({
  // Uncomment to enable standalone/iframe-mode
  build: {
    outputFolder: "tina",
    publicFolder: "public",
  },
  // tinaioConfig: {
  //   contentApiUrlOverride: "foo.io",
  // },
  branch: "main",
  clientId: "foobar",
  token: "foo",
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
