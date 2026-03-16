import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const ROOT = process.cwd()

function collectPackagesFromDir(dir, skipAt = false) {
  const results = []

  for (const entry of fs.readdirSync(dir)) {
    if (skipAt && entry.startsWith('@')) continue

    const pkgJsonPath = path.join(dir, entry, 'package.json')
    if (!fs.existsSync(pkgJsonPath)) continue

    const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'))
    if (pkg.private === true) continue

    results.push(path.dirname(pkgJsonPath))
  }

  return results
}

const packageDirs = [
  ...collectPackagesFromDir(path.join(ROOT, 'packages/@tinacms')),
  ...collectPackagesFromDir(path.join(ROOT, 'packages'), true),
]

for (const packageDir of packageDirs) {
  const relativeDir = path.relative(ROOT, packageDir)
  execFileSync('pnpm', ['dlx', 'publint', relativeDir], {
    cwd: ROOT,
    stdio: 'inherit',
  })
}
