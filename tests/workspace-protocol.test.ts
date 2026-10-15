import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

// pnpm publishes `workspace:^` as a caret range (`^1.2.3`), which lets npm
// dedupe internal packages against the consumer's copy. Any other workspace
// spec (`workspace:*`, `workspace:~`, `workspace:1.2.3`) publishes a pin that
// nests duplicate dependency trees — ~320 MB in a stock consumer app (#7207).
// devDependencies never ship, so they are exempt.
const SHIPPED_SECTIONS = [
  'dependencies',
  'peerDependencies',
  'optionalDependencies',
] as const

interface PkgRef {
  name: string
  pkgJsonPath: string
  pkg: Record<string, Record<string, string> | undefined>
}

function collectPackagesFromDir(dir: string, skipAt = false): PkgRef[] {
  const results: PkgRef[] = []

  for (const entry of fs.readdirSync(dir)) {
    if (skipAt && entry.startsWith('@')) continue

    const pkgJsonPath = path.join(dir, entry, 'package.json')
    if (!fs.existsSync(pkgJsonPath)) continue

    const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'))
    if (pkg.private === true) continue

    results.push({ name: pkg.name, pkgJsonPath, pkg })
  }

  return results
}

function discoverPackages(): PkgRef[] {
  return [
    ...collectPackagesFromDir(path.join(ROOT, 'packages/@tinacms')),
    ...collectPackagesFromDir(path.join(ROOT, 'packages'), true),
  ]
}

describe('workspace protocol in published packages', () => {
  it('uses workspace:^ for every internal ref in shipped dependency sections', () => {
    const violations: string[] = []

    for (const { name, pkgJsonPath, pkg } of discoverPackages()) {
      for (const section of SHIPPED_SECTIONS) {
        for (const [dep, spec] of Object.entries(pkg[section] ?? {})) {
          if (spec.startsWith('workspace:') && spec !== 'workspace:^') {
            violations.push(
              `${name} ${section}.${dep} = "${spec}" (${path.relative(ROOT, pkgJsonPath)})`
            )
          }
        }
      }
    }

    expect(violations).toEqual([])
  })
})
