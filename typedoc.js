module.exports = packageJson => {
  const gitRevision = `${packageJson.name}@${packageJson.version}`

  // TODO: If current branch is not `master` or `latest` then gitRevision is the current branch

  return {
    ignoreCompilerErrors: 'true',
    exclude: ['**/*+(.spec|.test|.e2e).ts', '**/*+(.spec|.test|.e2e).tsx'],
    excludeNotExported: false,
    gitRevision,
  }
}
