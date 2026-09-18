import {
  type Config,
  type ImportStatement,
  makeImportString,
} from '../prompts';

export type ConfigTemplateArgs = {
  publicFolder: string;
  isLocalEnvVarName?: string;
  config: Config;
  selfHosted?: boolean;
};

// Indents every line after the first, so a fragment written at column 0 can
// be spliced in after a `key: ` prefix at any depth.
const indent = (text: string, depth: number) =>
  text.split('\n').join(`\n${' '.repeat(depth)}`);

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
]`;

// The Astro demo hero is a fully editable content model: every text element
// (eyebrow, headline, tagline) and both call-to-action buttons (label + link).
const astroHeroFields = `[
  {
    type: 'string',
    name: 'eyebrow',
    label: 'Eyebrow',
  },
  {
    type: 'string',
    name: 'title',
    label: 'Headline',
    isTitle: true,
    required: true,
  },
  {
    type: 'rich-text',
    name: 'body',
    label: 'Tagline',
    isBody: true,
  },
  {
    type: 'object',
    name: 'ctaPrimary',
    label: 'Primary button',
    fields: [
      { type: 'string', name: 'label', label: 'Label' },
      { type: 'string', name: 'href', label: 'Link' },
    ],
  },
  {
    type: 'object',
    name: 'ctaSecondary',
    label: 'Secondary button',
    fields: [
      { type: 'string', name: 'label', label: 'Label' },
      { type: 'string', name: 'href', label: 'Link' },
    ],
  },
]`;

const nextRouter = `
  ui: {
    // This is an DEMO router. You can remove this to fit your site
    router: ({ document }) => \`/demo/blog/\${document._sys.filename}\`,
  },`;

const astroRouter = `
  ui: {
    // Opens the /tinacms-demo page for visual editing. Change or remove to fit your site.
    router: () => '/tinacms-demo',
  },`;

const postCollection = (fields: string, ui = '') => `{
  name: 'post',
  label: 'Posts',
  path: 'content/posts',
  fields: ${indent(fields, 2)},${ui}
}`;

const generateCollectionString = (args: ConfigTemplateArgs) => {
  let post = postCollection(baseFields);
  if (args.config?.framework?.name === 'next') {
    post = postCollection(baseFields, nextRouter);
  }
  if (args.config?.framework?.name === 'astro') {
    post = postCollection(astroHeroFields, astroRouter);
  }
  const collections = [
    ...(args.config.authProvider?.extraTinaCollections || []),
    post,
  ];
  return `[\n${collections.map((c) => `  ${indent(c, 2)},`).join('\n')}\n]`;
};

export const generateConfig = (args: ConfigTemplateArgs) => {
  const isUsingTinaCloud =
    !args.selfHosted || args.config.authProvider?.name === 'tina-cloud';

  const imports: ImportStatement[] = [
    { from: 'tinacms', imported: ['defineConfig'], packageName: 'tinacms' },
  ];
  if (args.selfHosted) {
    imports.push(...(args.config.authProvider?.configImports || []));
    if (!isUsingTinaCloud) {
      imports.push({
        from: 'tinacms',
        imported: ['LocalAuthProvider'],
        packageName: 'tinacms',
      });
    }
  }

  const declarations = [
    '// Your hosting provider likely exposes this as an environment variable',
    'const branch =',
    '  process.env.GITHUB_BRANCH ||',
    '  process.env.VERCEL_GIT_COMMIT_REF ||',
    '  process.env.HEAD ||',
    "  'main';",
  ];
  if (args.selfHosted && args.isLocalEnvVarName) {
    declarations.push(
      `const isLocal = process.env.${args.isLocalEnvVarName} === 'true';`
    );
  }

  const options: string[] = [];
  if (args.selfHosted && !isUsingTinaCloud) {
    options.push("contentApiUrlOverride: '/api/tina/gql',");
  }
  options.push('branch,');
  if (args.selfHosted && !isUsingTinaCloud) {
    options.push(
      'authProvider: isLocal',
      '  ? new LocalAuthProvider()',
      `  : ${args.config?.authProvider.configAuthProviderClass},`
    );
  }
  if (isUsingTinaCloud) {
    options.push(
      '// Get this from tina.io',
      'clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,',
      '// Get this from tina.io',
      'token: process.env.TINA_TOKEN,'
    );
  }

  return `${makeImportString(imports)}

${declarations.join('\n')}

export default defineConfig({
${options.map((line) => `  ${line}`).join('\n')}
  build: {
    outputFolder: 'admin',
    publicFolder: '${args.publicFolder}',
  },
  // Uncomment to allow cross-origin requests from non-localhost origins
  // during local development (e.g. GitHub Codespaces, Gitpod, Docker).
  // Use 'private' to allow all private-network IPs (WSL2, Docker, etc.)
  // server: {
  //   allowedOrigins: ['https://your-codespace.github.dev'],
  // },
  media: {
    tina: {
      mediaRoot: '',
      publicFolder: '${args.publicFolder}',
    },
  },
  // See docs on content modeling for more info on how to setup new content models: https://tina.io/docs/r/content-modelling-collections/
  schema: {
    collections: ${indent(generateCollectionString(args), 4)},
  },
});
`;
};
