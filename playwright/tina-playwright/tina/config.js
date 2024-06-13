import { defineConfig } from "tinacms";
import page from "./collections/page";
import post from "./collections/post";
import author from "./collections/author";

export const config = defineConfig({
  branch: "",
  clientId: "",
  token: "",
  build: {
    publicFolder: "public", // The public asset folder for your framework
    outputFolder: "admin", // within the public folder
  },
  schema: {
    collections: [page, post, author],
  },
});

export default config;
