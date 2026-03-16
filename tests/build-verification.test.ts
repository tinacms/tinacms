import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, it, test, expect } from 'vitest'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

interface PkgInfo {
  name: string
  pkgDir: string
  main?: string
  exports?: unknown
  types?: string
  typings?: string
  bin?: string | Record<string, string>
}

// Reads all sub-folders inside `dir`, finds those with a package.json,
// skips private packages, and returns their parsed info.
// `skipAt` — when true, skips folders whose name starts with "@"
// (used for packages/ root so we don't double-count @tinacms/*).
// Example output:
// [
//   { name: "@tinacms/cli", pkgDir: "/path/to/packages/@tinacms/cli", main: "./dist/index.js", ... },
//   { name: "tinacms",      pkgDir: "/path/to/packages/tinacms",      main: "./dist/index.js", ... },
// ]
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
    // Scoped packages: packages/@tinacms/app, cli, graphql, etc.
    ...collectPackagesFromDir(path.join(ROOT, 'packages/@tinacms')),
    // Top-level packages: tinacms, create-tina-app, next-tinacms-*, etc.
    // skipAt=true so we don't re-enter the @tinacms folder.
    ...collectPackagesFromDir(path.join(ROOT, 'packages'), true),
  ]
}

// ---------------------------------------------------------------------------
// Exports map walker
// Collects all leaf string values (file paths) from the exports map.
// Keys starting with "." are entry-point keys; others are condition keys.
// In both cases, string leaf values are always file paths to verify.
// Example output for this exports map:
// [
//   { entryKey: ".",        filePath: "./dist/index.mjs" },
//   { entryKey: ".",        filePath: "./dist/index.cjs" },
//   { entryKey: ".",        filePath: "./dist/index.d.ts" },
// ]
//---------------------------------------------------------------------------
function extractExportLeaves(
  node: unknown,
  entryKey = ''
): Array<{ entryKey: string; filePath: string }> {
  if (typeof node === 'string') {
    return [{ entryKey, filePath: node }]
  }
  if (node && typeof node === 'object' && !Array.isArray(node)) {
    const results: Array<{ entryKey: string; filePath: string }> = []
    for (const [key, value] of Object.entries(node)) {
      // Entry-point keys start with "." — use them as the label.
      // Condition keys (import, require, default, types, browser, etc.) — keep current label.
      const nextKey = key.startsWith('.') ? key : entryKey
      results.push(...extractExportLeaves(value, nextKey))
    }
    return results
  }
  return []
}

// ---------------------------------------------------------------------------
// Tests — one describe block per package
// ---------------------------------------------------------------------------

const packages = discoverPackages()

for (const pkg of packages) {
  const { name: pkgName, pkgDir } = pkg

  describe(pkgName, () => {
    // ------------------------------------------------------------------
    // main
    // ------------------------------------------------------------------
    if (pkg.main) {
      const absMain = path.resolve(pkgDir, pkg.main)

      if (pkgName === '@tinacms/app') {
        // NOTE: @tinacms/app intentionally uses "src/main.tsx" as its main field
        // (raw TSX source consumed directly by the host app, not a compiled dist file).
        it('main file exists (intentionally points to TSX source, not compiled output)', () => {
          expect(fs.existsSync(absMain)).toBe(true)
        })
      } else {
        it('main file exists', () => {
          expect(fs.existsSync(absMain)).toBe(true)
        })
      }
    }

    // ------------------------------------------------------------------
    // exports
    // ------------------------------------------------------------------
    if (pkg.exports) {
      const leaves = extractExportLeaves(pkg.exports)

      for (const { entryKey, filePath } of leaves) {
        const absPath = path.resolve(pkgDir, filePath)
        const label = `exports ${entryKey || filePath} → ${filePath} exists`

        it(label, () => {
          expect(fs.existsSync(absPath)).toBe(true)
        })
      }
    }

    // ------------------------------------------------------------------
    // types / typings
    // ------------------------------------------------------------------
    const typesField = pkg.types ?? pkg.typings
    if (typesField) {
      it('types/typings file exists and is non-empty', () => {
        const absPath = path.resolve(pkgDir, typesField)
        expect(fs.existsSync(absPath)).toBe(true)
        expect(fs.statSync(absPath).size).toBeGreaterThan(0)
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
        it(`bin "${binName}" exists and is executable`, () => {
          const absPath = path.resolve(pkgDir, binPath)
          expect(fs.existsSync(absPath)).toBe(true)
          expect(() => fs.accessSync(absPath, fs.constants.X_OK)).not.toThrow()
        })
      }
    }


  })
}
