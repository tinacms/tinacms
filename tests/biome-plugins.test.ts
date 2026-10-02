import { spawnSync } from 'node:child_process'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

interface Diagnostic {
  category: string
  message: string
  location: { path: string }
}

// Fixtures sit under a `packages/v4` path so the plugin `includes` globs in
// biome.json match them. `pnpm lint` only scans ./packages and ./examples.
function lintFixtures(): Diagnostic[] {
  const result = spawnSync(
    'pnpm',
    [
      'exec',
      'biome',
      'lint',
      '--reporter=json',
      '--max-diagnostics=100',
      'tests/biome-fixtures',
    ],
    { cwd: ROOT, encoding: 'utf8' }
  )
  const json = result.stdout.slice(result.stdout.indexOf('{'))
  return JSON.parse(json).diagnostics
}

function pluginDiagnostics(all: Diagnostic[], file: string) {
  return all.filter(
    (d) => d.category === 'plugin' && d.location.path.endsWith(file)
  )
}

const NARROWING = /^Narrow an error/
const CONDITIONAL_JSX = /^Render a conditional element/

describe('biome GritQL plugins', () => {
  const diagnostics = lintFixtures()

  it('flags forbidden error narrowing and conditional JSX', () => {
    const bad = pluginDiagnostics(diagnostics, 'bad.tsx')
    expect(bad.filter((d) => NARROWING.test(d.message))).toHaveLength(2)
    expect(bad.filter((d) => CONDITIONAL_JSX.test(d.message))).toHaveLength(6)
  })

  it('stays quiet on the allowed forms', () => {
    expect(pluginDiagnostics(diagnostics, 'good.tsx')).toEqual([])
  })
})
