export function generateGqlScript(scriptValue) {
  return `tinacms server:start -c "${scriptValue}"`
}

export function extendNextScripts(scripts) {
  return {
    ...scripts,
    dev: generateGqlScript(scripts.dev || 'next dev'),
    build: generateGqlScript(scripts.build || 'next build'),
    start: generateGqlScript(scripts.start || 'next start'),
  }
}
