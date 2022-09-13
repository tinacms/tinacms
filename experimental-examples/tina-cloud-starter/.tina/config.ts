import { defineConfig } from "tinacms";
import schema from "./schema";
import client from "./__generated__/client";

export default defineConfig({
  // Uncomment to enable standalone/iframe-mode
  // build: {
  //   outputFolder: "tina",
  //   publicFolder: "public",
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
