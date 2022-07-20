---
'@tinacms/cli': minor
'@tinacms/graphql': minor
'@tinacms/schema-tools': patch
---

This PR adds the new generated client, a new build command and introduces a new path of working with tina. 


# How to upgrade


## Updates to schema.ts

Instead of passing an ApiURL, now the clientID, branch and read only token (NEW) will all be configured in the schema. The local url will be used if the --local flag is passed.

This will require a change to the schema and the scripts.

```diff 
// .tina/schema.ts

+ import { client } from "./__generated__/client";

// ... 

const schema = defineSchema({
+    config: {
+        branch: "main",
+        clientID: "***",
+        token: "***",
    },
    collections: [
        // ...
    ]
})

// ...
- const branch = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF
- const clientId = 'YOUR-CLIENT-ID-HERE'
- const apiURL =
-   process.env.NODE_ENV == 'development'
-     ? 'http://localhost:4001/graphql'
-    : `https://content.tinajs.io/content/${clientId}/github/${branch}`
export const tinaConfig = defineConfig({
+  client,
-  apiURl,
  schema,
  // ...
})

export default schema
```

The token must be a wildcard token (`*`) and can be generated from the tina dashboard. [Read more hear](https://tina.io/docs/graphql/read-only-tokens/)


## Updates to scripts in package.json

We are now recommending separating the graphQL server into two separate process (could use two separate terminals in development). The scripts should look like this.

```json
{
    "scripts": { 
        "dev": "tinacms build --local && next dev",
        "dev-server": "tinacms server:start",
        "build": "tinacms build && next build", 
        // ... Other Scripts 
    }
}
```
And then when developing in one terminal run `yarn dev-server` and then `yarn dev` in another.

The old `-c` subcommand can still be used. This will start the dev server and next dev process in the same terminal.


```json
{
    "scripts": { 
        "dev": "tinacms server:start \"tinacms build --local && next dev\"",
        "dev-server": "tinacms server:start",
        "build": "tinacms build && next build", 
        // ... Other Scripts 
    }
}
```

## Updates to generated files

We are now recommending to ignore Most of the generated files. This is because `client.ts` and `types.ts` will be generated in CI with `tinacms build`

To remove them run `git rm --cached .tina/__generated__/* ` and then `yarn tinacms build` to update the generated files that need to stay. 





