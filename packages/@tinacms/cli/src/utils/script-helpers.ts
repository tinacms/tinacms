/**



*/

export function generateGqlScript(
  scriptValue,
  opts?: { isLocalEnvVarName?: string }
) {
  const cmd = `tinacms dev -c "${scriptValue}"`;
  if (opts?.isLocalEnvVarName) {
    return `${opts.isLocalEnvVarName}=true ${cmd}`;
  }
  return cmd;
}

export function extendNextScripts(
  scripts,
  opts?: { isLocalEnvVarName?: string; addSetupUsers?: boolean }
) {
  const result = {
    ...scripts,
    dev:
      !scripts?.dev || scripts?.dev?.indexOf('tinacms dev -c') === -1
        ? generateGqlScript(scripts?.dev || 'next dev', opts)
        : scripts?.dev,
    build:
      !scripts?.build || !scripts?.build?.startsWith('tinacms build &&')
        ? `tinacms build && ${scripts?.build || 'next build'}`
        : scripts?.build,
  };

  if (opts?.addSetupUsers && !scripts['setup:users']) {
    result['setup:users'] = 'tinacms-next-auth setup';
  }

  return result;
}

// Astro is not reactive (no `useTina`), but `init` still wraps its dev/build
// scripts so `dev` runs Tina + Astro together and `build` compiles the admin
// first. Existing dev/build commands are preserved (wrapped, not replaced).
export function extendAstroScripts(scripts) {
  return {
    ...scripts,
    dev:
      !scripts?.dev || scripts?.dev?.indexOf('tinacms dev -c') === -1
        ? generateGqlScript(scripts?.dev || 'astro dev')
        : scripts?.dev,
    build:
      !scripts?.build || !scripts?.build?.startsWith('tinacms build &&')
        ? `tinacms build && ${scripts?.build || 'astro build'}`
        : scripts?.build,
  };
}
