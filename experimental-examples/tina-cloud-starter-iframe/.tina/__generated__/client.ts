import { createClient } from "tinacms/dist/client";
import { queries } from "./types";
export const client = createClient({ url: 'http://localhost:4001/graphql', token: 'ed05987e10e19e6e3118024610b53d2377ae07b7', queries });
export default client;
  