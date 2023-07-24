/**



*/

export function generateGqlScript(
  scriptValue,
  opts?: { isLocalEnvVarName?: string }
) {
  const cmd = `tinacms dev -c "${scriptValue}"`
  if (opts?.isLocalEnvVarName) {
    return `${opts.isLocalEnvVarName}=true ${cmd}`
  }
  return cmd
}

export function extendNextScripts(
  scripts,
  opts?: { isLocalEnvVarName?: string }
) {
  return {
    ...scripts,
    dev: generateGqlScript(scripts?.dev || 'next dev', opts),
    build: `tinacms build && ${scripts?.build || 'next build'}`,
    start: `tinacms build && ${scripts?.start || 'next start'}`,
  }
}
