/**

Copyright 2019 Forestry.io Inc

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

module.exports = packageJson => {
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
