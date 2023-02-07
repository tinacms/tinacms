/**



*/

module.exports = (packageJson) => {
  const gitRevision = `${packageJson.name}@${packageJson.version}`
  const outDir = `${__dirname}/docs/${gitRevision}`

  // TODO: If current branch is not `master` or `latest` then gitRevision is the current branch

  return {
    ignoreCompilerErrors: 'true',
    exclude: [
      '**/*+(index|.spec|.test|.e2e).ts',
      '**/*+(index|.spec|.test|.e2e).tsx',
    ],
    out: outDir,
    excludeNotExported: false,
    gitRevision,
  }
}
