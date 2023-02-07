/**



*/

export function generateGqlScript(scriptValue) {
  return `tinacms dev -c "${scriptValue}"`
}

export function extendNextScripts(scripts) {
  return {
    ...scripts,
    dev: generateGqlScript(scripts?.dev || 'next dev'),
    build: `tinacms build && ${scripts?.build || 'next build'}`,
    start: `tinacms build && ${scripts?.start || 'next start'}`,
  }
}
