type EsbuildErrorLike = {
  message?: string;
  errors?: Array<{
    text?: string;
  }>;
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

// A package specifier belongs to TinaCMS if it is the `tinacms` package itself
// or one of the scoped `@tinacms/*` packages (e.g. @tinacms/schema-tools,
// @tinacms/datalayer). Lookalikes such as `my-tinacms-plugin` are excluded.
const isTinaPackage = (specifier: string) =>
  specifier === 'tinacms' || specifier.startsWith('@tinacms/');

// Pull every `Could not resolve "<specifier>"` target out of an esbuild error
// string. esbuild surfaces this both as structured `errors[].text` entries and
// as the flattened `Error.message`, so callers feed us both.
const collectResolveTargets = (text: string | undefined): string[] => {
  if (!text) {
    return [];
  }
  const targets: string[] = [];
  const pattern = /Could not resolve "([^"]+)"/g;
  for (const match of text.matchAll(pattern)) {
    targets.push(match[1]);
  }
  return targets;
};

// Returns the first unresolved TinaCMS package specifier found in the error, or
// null if the error isn't a TinaCMS resolution failure.
const getUnresolvedTinaPackage = (error: unknown): string | null => {
  if (!isObject(error)) {
    return null;
  }

  const esbuildError = error as EsbuildErrorLike;
  const targets = [
    ...(esbuildError.errors ?? []).flatMap((item) =>
      collectResolveTargets(item.text)
    ),
    ...collectResolveTargets(esbuildError.message),
  ];

  return targets.find(isTinaPackage) ?? null;
};

export const isTinacmsResolveError = (error: unknown): boolean =>
  getUnresolvedTinaPackage(error) !== null;

export const formatConfigBuildError = ({
  error,
  rootPath,
}: {
  error: unknown;
  rootPath: string;
}) => {
  const unresolvedPackage = getUnresolvedTinaPackage(error);
  if (!unresolvedPackage) {
    return error;
  }

  return new Error(
    [
      `Unable to resolve the "${unresolvedPackage}" package while building your Tina config.`,
      '',
      `Tina looked from: ${rootPath}`,
      '',
      'Make sure the TinaCMS packages are installed in this project and that you are running the CLI from the project root.',
      'If they are installed, check parent directories for package-manager files that can interfere with module resolution, such as package.json, node_modules, yarn.lock, or .pnp.cjs.',
    ].join('\n')
  );
};
