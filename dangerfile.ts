import { markdown, danger, warn, message } from 'danger'

const allFiles = [
  ...danger.git.created_files,
  ...danger.git.deleted_files,
  ...danger.git.modified_files,
]

interface TinaPackage {
  path: string
  packageJson: any
}

let modifiedPackages = getModifiedPackages()

modifiedPackages.forEach(p => {
  warnIfMissingChangelogEntry(p)
  warnIfMissingTestChanges(p)
})

listTouchedPackages()
listTouchedWorkflows()

function listTouchedWorkflows() {
  message(`### Modified Github Workflows
* ${allFiles
    .filter(filepath => filepath.startsWith('.github/workflows/'))
    .join('\n* ')}`)
}

function listTouchedPackages() {
  if (!modifiedPackages.length) return
  markdown(`### Modified Packages

The following packages were modified by this pull request:

* ${modifiedPackages
    .map(({ packageJson }) => `\`${packageJson.name}\``)
    .join('\n* ')}`)
}

function warnIfMissingChangelogEntry({ path, packageJson }: TinaPackage) {
  const hasCHANGELOGChanges = !!danger.git.modified_files.find(
    p => p === `${path}/CHANGELOG.md`
  )
  if (!hasCHANGELOGChanges) {
    warn(`\`${packageJson.name}\` may need a CHANGELOG entry.`)
  }
}

function warnIfMissingTestChanges({ path, packageJson }: TinaPackage) {
  const hasCHANGELOGChanges = !!danger.git.modified_files.find(p =>
    p.match(/.*.test.tsx?/)
  )
  if (!hasCHANGELOGChanges) {
    warn(`\`${packageJson.name}\` may need new tests.`)
  }
}

function getModifiedPackages() {
  let packageList: TinaPackage[] = []
  let paths = new Set(
    allFiles
      .filter(filepath => filepath.startsWith('packages/'))
      .filter(filepath => !filepath.startsWith('packages/demo'))
      .map(filepath =>
        filepath
          .split('/')
          .slice(0, 3)
          .join('/')
      )
  )

  paths.forEach(path => {
    let packageJson = require(`./${path}/package.json`)

    packageList.push({
      path,
      packageJson,
    })
  })
  return packageList
}
