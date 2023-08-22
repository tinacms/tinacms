export type Variables = {
  isLocalEnvVarName: string
}

export type DatabaseAdapterTypes = 'upstash-redis'

export const templates: {
  [key in DatabaseAdapterTypes]: (vars?: Variables) => string
} = {
  ['upstash-redis']: (
    vars: Variables
  ) => `// THIS FILE HAS BEEN GENERATED WITH THE TINA CLI.
import {
  createDatabase,
  createLocalDatabase,
} from "@tinacms/datalayer";
import {
  GitHubProvider,
} from "tinacms-gitprovider-github";
import { Redis } from "@upstash/redis";
import { RedisLevel } from "upstash-redis-level";

// Manage this flag in your CI/CD pipeline and make sure it is set to false in production
const isLocal = process.env.${vars.isLocalEnvVarName} === "true";

const branch = (process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  "main")


const redisUrl = process.env.KV_REST_API_URL
const redisToken = process.env.KV_REST_API_TOKEN

if (!branch) {
  throw new Error(
    "No branch found. Make sure that you have set the GITHUB_BRANCH or process.env.VERCEL_GIT_COMMIT_REF environment variable."
  );
}

if (!redisUrl) {
  throw new Error(
    "No KV_REST_API_URL found. Make sure that you have set the KV_REST_API_URL environment variable."
  )
}

if (!redisToken) {
  throw new Error(
    "No KV_REST_API_TOKEN found. Make sure that you have set the KV_REST_API_TOKEN environment variable."
  )
}

export default isLocal
  ? createLocalDatabase()
  : createDatabase({
      gitProvider: new GitHubProvider({
        repo: process.env.GITHUB_REPO || process.env.VERCEL_GIT_REPO_SLUG || 'missing-repo',
        owner: process.env.GITHUB_OWNER || process.env.VERCEL_GIT_REPO_OWNER || 'missing-owner',
        token: process.env.GITHUB_PERSONAL_ACCESS_TOKEN || 'missing-token',
        branch,
      }),
      databaseAdapter: new RedisLevel({
        redis: new Redis({
          url: redisUrl,
          token: redisToken,
        }),
        debug: process.env.DEBUG === "true" || false,
        namespace: branch,
      }),
    });
`,
}
