import { defineStaticConfig } from "tinacms";
import { schema } from "./schema";

export default defineStaticConfig({
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID!,
  branch:
    process.env.NEXT_PUBLIC_TINA_BRANCH! || // custom branch env override
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF! || // Vercel branch env
    process.env.HEAD!, // Netlify branch env
  token: process.env.TINA_TOKEN!,
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
