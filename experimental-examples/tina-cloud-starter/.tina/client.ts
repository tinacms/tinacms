import { createClient } from "tinacms/dist/client";
import { queries } from "./__generated__/types";

const branch = "main";
const apiURL =
  process.env.NODE_ENV == "development"
    ? "http://localhost:4001/graphql"
    : `https://content.tinajs.io/content/${process.env.NEXT_PUBLIC_TINA_CLIENT_ID}/github/${branch}`;

// Token generated on app.tina.io
export const client = createClient({ url: apiURL, token: "***", queries });

export default client;
