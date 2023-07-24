/**

*/

import type { Framework } from '..'

export type ConfigTemplateVariables = {
  extraText?: string
  publicFolder: string
  collections?: string
  token?: string
  clientId?: string
  nextAuthCredentialsProviderName?: string
  isLocalEnvVarName?: string
}

export type ConfigTemplateOptions = {
  isForestryMigration?: boolean
  nextAuth?: boolean
  selfHosted?: boolean
  dataLayer?: boolean
}

const clientConfig = (isForestryMigration?: boolean) => {
  if (isForestryMigration) {
    return 'client: {skip: true},'
  }
  return ''
}

const other = (vars: ConfigTemplateVariables, opts: ConfigTemplateOptions) => {
  const authConfig =
    (!opts.selfHosted &&
      `  clientId: ${
        vars.clientId ? `'${vars.clientId}'` : 'null'
      }, // Get this from tina.io
  token:  ${
    vars.token ? `'${vars.token}'` : 'null'
  }, // Get this from tina.io`) ||
    ''
  return `
import { defineConfig } from "tinacms";
${vars.extraText || ''}

// Your hosting provider likely exposes this as an environment variable
const branch = process.env.HEAD || process.env.VERCEL_GIT_COMMIT_REF || "main";

export default defineConfig({
  branch,
  ${authConfig}
  ${clientConfig(opts.isForestryMigration)}
  build: {
    outputFolder: "admin",
    publicFolder: "${vars.publicFolder}",
  },
  media: {
    tina: {
      mediaRoot: "",
      publicFolder: "${vars.publicFolder}",
    },
  },
  schema: {
    collections: ${
      vars.collections ||
      `[
      {
        name: "post",
        label: "Posts",
        path: "content/posts",
        fields: [
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true,
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true,
          },
        ],
      },
    ]`
    },
  },
});
`
}
type Keys = Framework['name']

export const configExamples: {
  [key in Keys]: (
    vars?: ConfigTemplateVariables,
    opts?: ConfigTemplateOptions
  ) => string
} = {
  next: (args, opts) => {
    const authConfig = opts.nextAuth
      ? `admin: {
        auth: {
          useLocalAuth: isLocal,
          customAuth: !isLocal,
          ...createTinaNextAuthHandler({
            callbackUrl: '/admin/index.html',
            isLocalDevelopment: isLocal,
            name: '${args.nextAuthCredentialsProviderName}',
          })
      }
      },`
      : `clientId: ${
          args.clientId ? `'${args.clientId}'` : 'null'
        }, // Get this from tina.io
    token:  ${
      args.token ? `'${args.token}'` : 'null'
    }, // Get this from tina.io`
    return `import { defineConfig } from 'tinacms'
  ${
    opts.nextAuth
      ? `import { createTinaNextAuthHandler } from 'tinacms-next-auth/dist/tinacms'
  `
      : ''
  }
  // Your hosting provider likely exposes this as an environment variable
  const branch = process.env.HEAD || process.env.VERCEL_GIT_COMMIT_REF || 'main'
  ${
    (args.isLocalEnvVarName &&
      `const isLocal = process.env.${args.isLocalEnvVarName}`) ||
    ''
  }

  export default defineConfig({
    ${opts.dataLayer ? `contentApiUrlOverride: "/api/gql"` : ''}
    branch,
    ${authConfig}
    ${clientConfig(opts.isForestryMigration)}
    build: {
      outputFolder: "admin",
      publicFolder: "${args.publicFolder}",
    },
    media: {
      tina: {
        mediaRoot: "",
        publicFolder: "${args.publicFolder}",
      },
    },
    schema: {
      collections:${
        args.collections ||
        `[
        {
          name: 'post',
          label: 'Posts',
          path: 'content/posts',
          fields: [
            {
              type: 'string',
              name: 'title',
              label: 'Title',
              isTitle: true,
              required: true,
            },
            {
              type: 'rich-text',
              name: 'body',
              label: 'Body',
              isBody: true,
            },
          ],
          ui: {
            // This is an DEMO router. You can remove this to fit your site
            router: ({ document }) => \`/demo/blog/\${document._sys.filename}\`,
          },
        },
      ]`
      },
    },
  })
  `
  },
  other,
  hugo: other,
  jekyll: other,
}
