import { Config, makeImportString } from '../prompts'

export type ConfigTemplateArgs = {
  extraText?: string
  publicFolder: string
  collections?: string
  isLocalEnvVarName?: string
  config: Config
  isForestryMigration?: boolean
  selfHosted?: boolean
}

const clientConfig = (isForestryMigration?: boolean) => {
  if (isForestryMigration) {
    return 'client: {skip: true},'
  }
  return ''
}
const baseFields = `[
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
]`

const generateCollectionString = (args: ConfigTemplateArgs) => {
  if (args.collections) {
    return args.collections
  }
  const extraTinaCollections =
    args.config.authenticationProvider?.extraTinaCollections?.join(',\n') + ','

  const baseCollections = `[
    ${extraTinaCollections || ''}
    {
      name: 'post',
      label: 'Posts',
      path: 'content/posts',
      fields: ${baseFields},
    },
  ]`
  const nextExampleCollection = `[
    {
      ${extraTinaCollections || ''}
      name: 'post',
      label: 'Posts',
      path: 'content/posts',
      fields: ${baseFields},
      ui: {
        // This is an DEMO router. You can remove this to fit your site
        router: ({ document }) => \`/demo/blog/\${document._sys.filename}\`,
      },
    },
  ]`
  if (args.config?.framework?.name === 'next') {
    return nextExampleCollection
  }
  return baseCollections
}

export const generateConfig = (args: ConfigTemplateArgs) => {
  const isUsingTinaCloud =
    !args.selfHosted ||
    args.config.authenticationProvider?.name === 'tina-cloud'

  let extraImports = ''
  if (args.selfHosted) {
    // add imports for authentication provider
    if (args.config.authenticationProvider) {
      extraImports =
        extraImports +
        makeImportString(args.config.authenticationProvider?.configImports)
    }
    // if wer are not using tina cloud, we need to import the local auth provider
    if (!isUsingTinaCloud) {
      extraImports =
        extraImports + `\nimport { LocalAuthProvider } from "tinacms";`
    }
  }

  return `
  import { defineConfig } from "tinacms";
  ${extraImports}
  ${args.extraText || ''}
  
  // Your hosting provider likely exposes this as an environment variable
  const branch = process.env.GITHUB_BRANCH ||
    process.env.VERCEL_GIT_COMMIT_REF ||
    process.env.HEAD ||
    "main"
  ${
    (args.isLocalEnvVarName &&
      args.selfHosted &&
      `const isLocal = process.env.${args.isLocalEnvVarName} === 'true'`) ||
    ''
  }
  export default defineConfig({
    ${
      args.selfHosted && !isUsingTinaCloud
        ? `contentApiUrlOverride: "/api/tina/gql",`
        : ''
    }
    branch,
    ${
      args.selfHosted && !isUsingTinaCloud
        ? `authProvider: isLocal
    ? new LocalAuthProvider()
    :${args.config?.authenticationProvider.configAuthenticationClass},`
        : ''
    }
    ${
      isUsingTinaCloud
        ? `// Get this from tina.io
        clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,`
        : ''
    }
    ${
      isUsingTinaCloud
        ? `// Get this from tina.io
    token: process.env.TINA_TOKEN,`
        : ''
    }

    ${clientConfig(args.isForestryMigration)}
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
    // See docs on content modeling for more info on how to setup new content models: https://tina.io/docs/schema/
    schema: {
      collections: ${generateCollectionString(args)},
    },
  });  
`
}
