import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import picomatch from 'picomatch'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

interface PkgInfo {
  name: string
  pkgDir: string
  files?: string[]
  main?: string
  exports?: unknown
  types?: string
  typings?: string
  bin?: string | Record<string, string>
}

// ---------------------------------------------------------------------------
// Package discovery (same as build-verification.test.ts)
// ---------------------------------------------------------------------------

function collectPackagesFromDir(dir: string, skipAt = false): PkgInfo[] {
  const results: PkgInfo[] = []

  for (const entry of fs.readdirSync(dir)) {
    if (skipAt && entry.startsWith('@')) continue

    const pkgJsonPath = path.join(dir, entry, 'package.json')
    if (!fs.existsSync(pkgJsonPath)) continue

    const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'))
    if (pkg.private === true) continue

    results.push({ ...pkg, pkgDir: path.dirname(pkgJsonPath) })
  }

  return results
}

function discoverPackages(): PkgInfo[] {
  return [
    ...collectPackagesFromDir(path.join(ROOT, 'packages/@tinacms')),
    ...collectPackagesFromDir(path.join(ROOT, 'packages'), true),
  ]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Collect all leaf file paths from an exports map.
function extractExportPaths(node: unknown): string[] {
  if (typeof node === 'string') return [node]
  if (node && typeof node === 'object' && !Array.isArray(node)) {
    return Object.values(node).flatMap((v) => extractExportPaths(v))
  }
  return []
}

// Strip leading "./" for consistent comparison.
function normalize(p: string): string {
  return p.replace(/^\.\//, '').replace(/\/$/, '')
}

// Returns true if `filePath` would be included by the npm `files` field.
//
// npm rules:
//   - A bare directory name like "dist" includes everything under dist/.
//   - Glob patterns (e.g. "bin/*") are matched with picomatch.
//   - If no `files` field exists, npm ships everything → always included.
//
// Example:
//   isIncludedByFiles('./dist/index.js', ['dist', 'bin/*']) → true
//   isIncludedByFiles('./src/secret.ts', ['dist'])           → false
function isIncludedByFiles(filePath: string, files: string[]): boolean {
  const target = normalize(filePath)

  return files.some((pattern) => {
    const p = normalize(pattern)
    // Exact match
    if (target === p) return true
    // Directory prefix: "dist" covers "dist/index.js"
    if (target.startsWith(p + '/')) return true
    // Glob match
    return picomatch(p)(target)
  })
}

// ---------------------------------------------------------------------------
// Tests — one describe block per package
// ---------------------------------------------------------------------------

const packages = discoverPackages()

for (const pkg of packages) {
  const { name: pkgName } = pkg

  // If a package has no `files` field, npm publishes everything — skip it,
  // there is nothing to verify.
  if (!pkg.files || pkg.files.length === 0) continue

  describe(pkgName, () => {
    // ------------------------------------------------------------------
    // main
    // ------------------------------------------------------------------
    if (pkg.main) {
      it(`"main" (${pkg.main}) is covered by the "files" field`, () => {
        expect(
          isIncludedByFiles(pkg.main!, pkg.files!),
          `"${pkg.main}" is not matched by any entry in "files": ${JSON.stringify(pkg.files)}`
        ).toBe(true)
      })
    }

    // ------------------------------------------------------------------
    // exports
    // ------------------------------------------------------------------
    if (pkg.exports) {
      const exportPaths = extractExportPaths(pkg.exports)

      for (const filePath of exportPaths) {
        it(`exports path "${filePath}" is covered by the "files" field`, () => {
          expect(
            isIncludedByFiles(filePath, pkg.files!),
            `"${filePath}" is not matched by any entry in "files": ${JSON.stringify(pkg.files)}`
          ).toBe(true)
        })
      }
    }

    // ------------------------------------------------------------------
    // types / typings
    // ------------------------------------------------------------------
    const typesField = pkg.types ?? pkg.typings
    if (typesField) {
      it(`"types" (${typesField}) is covered by the "files" field`, () => {
        expect(
          isIncludedByFiles(typesField, pkg.files!),
          `"${typesField}" is not matched by any entry in "files": ${JSON.stringify(pkg.files)}`
        ).toBe(true)
      })
    }

    // ------------------------------------------------------------------
    // bin
    // ------------------------------------------------------------------
    if (pkg.bin) {
      const binEntries: Array<[string, string]> =
        typeof pkg.bin === 'string'
          ? [[pkgName, pkg.bin]]
          : (Object.entries(pkg.bin) as Array<[string, string]>)

      for (const [binName, binPath] of binEntries) {
        it(`bin "${binName}" (${binPath}) is covered by the "files" field`, () => {
          expect(
            isIncludedByFiles(binPath, pkg.files!),
            `"${binPath}" is not matched by any entry in "files": ${JSON.stringify(pkg.files)}`
          ).toBe(true)
        })
      }
    }
  })
}
