import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { afterAll, describe, expect, it } from 'vitest';

import {
  TOLERANCES,
  compare,
  compareScalar,
  isWorkspacePackageName,
  lockKeyPackageNames,
  stripWorkspaceEntries,
  unpackedSizeOfTarball,
  writeStepSummary,
} from '../scripts/size-baseline.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASELINES = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'size-baselines.json'), 'utf-8')
);

const KB = 1024;
const MB = 1024 * KB;

// ─────────────────────────────────────────────────────────────────────────────
// compareScalar — the tolerance math every budget rides on
// ─────────────────────────────────────────────────────────────────────────────

describe('compareScalar', () => {
  const band = { pct: 0.05, abs: 25 * KB };

  it('warns when there is no baseline yet', () => {
    const r = compareScalar('new-pkg', undefined, 1234, band);
    expect(r.status).toBe('warn');
    expect(r.detail).toMatch(/no baseline/);
  });

  it('passes an unchanged metric', () => {
    expect(compareScalar('x', 1 * MB, 1 * MB, band).status).toBe('ok');
  });

  it('passes exactly at the threshold and fails one byte over', () => {
    const baseline = 10 * MB;
    const threshold = baseline + Math.max(baseline * band.pct, band.abs);
    expect(compareScalar('x', baseline, threshold, band).status).toBe('ok');
    expect(compareScalar('x', baseline, threshold + 1, band).status).toBe(
      'fail'
    );
  });

  it('uses the percentage term when the baseline is large', () => {
    // 5% of 10 MB = 512 KB, which dominates the 25 KB floor.
    const baseline = 10 * MB;
    expect(compareScalar('x', baseline, baseline + 500 * KB, band).status).toBe(
      'ok'
    );
    expect(compareScalar('x', baseline, baseline + 600 * KB, band).status).toBe(
      'fail'
    );
  });

  it('uses the absolute term when the baseline is small', () => {
    // 5% of 16 KB = 819 B, so the 25 KB floor is what actually applies.
    const baseline = 16 * KB;
    expect(compareScalar('x', baseline, baseline + 20 * KB, band).status).toBe(
      'ok'
    );
    expect(compareScalar('x', baseline, baseline + 30 * KB, band).status).toBe(
      'fail'
    );
  });

  it('warns on a decrease of more than 10% so the win gets re-baselined', () => {
    const baseline = 100 * MB;
    expect(compareScalar('x', baseline, baseline * 0.95, band).status).toBe(
      'ok'
    );
    const r = compareScalar('x', baseline, baseline * 0.8, band);
    expect(r.status).toBe('warn');
    expect(r.detail).toMatch(/size:update/);
  });

  it('does not divide by zero on a zero baseline', () => {
    const r = compareScalar('x', 0, 0, band);
    expect(r.status).toBe('ok');
    expect(r.detail).not.toMatch(/NaN/);
  });

  it('reports both the byte and percentage delta', () => {
    const r = compareScalar('x', 1 * MB, 1 * MB + 100 * KB, band);
    expect(r.detail).toMatch(/\+100\.0 KB/);
    expect(r.detail).toMatch(/\+9\.8%/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TOLERANCES — the bands must actually fire on the regressions this job exists
// for, measured against the real committed baseline. These assertions are the
// tripwire for someone quietly widening a band back out.
// ─────────────────────────────────────────────────────────────────────────────

describe('TOLERANCES against the committed baseline', () => {
  const bandFor = (baseline: number, t: { pct: number; abs: number }) =>
    Math.max(baseline * t.pct, t.abs);

  it('no band is dominated by an absolute floor larger than its metric', () => {
    // The bug this replaced: a 5 MB floor applied to every metric, so a 16 KB
    // package could grow 300x and stay green.
    for (const size of Object.values(BASELINES.packages) as number[]) {
      expect(bandFor(size, TOLERANCES.package)).toBeLessThan(2 * size);
    }
  });

  it('the install closure fires well below a nested duplicate or a chunky dep', () => {
    const allowed = bandFor(
      BASELINES.installClosureBytes,
      TOLERANCES.installClosure
    );
    expect(allowed).toBeGreaterThan(1 * MB); // not so tight it flakes on hoisting
    expect(allowed).toBeLessThan(20 * MB); // typescript (~23 MB) must trip it
  });

  it('the admin bundle fires on a re-bundled lazy chunk (#7245 / #7246)', () => {
    const allowed = bandFor(
      BASELINES.adminOutput.totalBytes,
      TOLERANCES.adminOutput
    );
    expect(allowed).toBeGreaterThan(100 * KB); // ordinary editor work is smaller
    expect(allowed).toBeLessThan(1 * MB); // mermaid/posthog chunks are larger
  });

  it('every package band sits between a source edit and a bundled dependency', () => {
    for (const [name, size] of Object.entries(BASELINES.packages) as [
      string,
      number,
    ][]) {
      const allowed = bandFor(size, TOLERANCES.package);
      expect(allowed, name).toBeGreaterThanOrEqual(25 * KB);
      expect(allowed, name).toBeLessThan(256 * KB);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// compare — metric routing, and the zero-tolerance watchlist
// ─────────────────────────────────────────────────────────────────────────────

const baselineFixture = {
  installClosureBytes: 1000 * MB,
  watchlist: {
    tinacms: 1,
    mermaid: 1,
    'date-fns': 1,
    typescript: 2,
    react: 1,
    graphql: 1,
    lodash: 6,
  },
  packages: { 'pkg-a': 100 * KB, 'pkg-b': 4 * MB },
  adminOutput: { totalBytes: 9 * MB },
};

const currentFrom = (overrides: Record<string, unknown> = {}) => ({
  installClosureBytes: baselineFixture.installClosureBytes,
  watchlist: { ...baselineFixture.watchlist },
  packages: { ...baselineFixture.packages },
  adminOutput: { ...baselineFixture.adminOutput },
  ...overrides,
});

const rowFor = (results: { group: string; detail: string }[], needle: string) =>
  results.find((r) => r.detail.includes(needle));

describe('compare', () => {
  it('is all-green for an unchanged tree, apart from pre-existing duplicates', () => {
    const results = compare(baselineFixture, currentFrom());
    expect(results.filter((r) => r.status === 'fail')).toEqual([]);
    // typescript x2 and lodash x6 are baselined but still warn, so they stay
    // visible and get driven back down to 1.
    const warned = results
      .filter((r) => r.status === 'warn')
      .map((r) => r.detail);
    expect(warned.some((d) => d.startsWith('typescript:'))).toBe(true);
    expect(warned.some((d) => d.startsWith('lodash:'))).toBe(true);
  });

  it('fails on a brand-new duplicate with no tolerance band', () => {
    const results = compare(
      baselineFixture,
      currentFrom({ watchlist: { ...baselineFixture.watchlist, tinacms: 2 } })
    );
    const row = rowFor(results, 'tinacms:');
    expect(row?.status).toBe('fail');
    expect(row?.detail).toMatch(/zero tolerance/);
  });

  it('fails when an already-duplicated package duplicates further', () => {
    const results = compare(
      baselineFixture,
      currentFrom({ watchlist: { ...baselineFixture.watchlist, lodash: 7 } })
    );
    expect(rowFor(results, 'lodash:')?.status).toBe('fail');
  });

  it('warns (not fails) when a duplicate count improves', () => {
    const results = compare(
      baselineFixture,
      currentFrom({ watchlist: { ...baselineFixture.watchlist, lodash: 1 } })
    );
    const row = rowFor(results, 'lodash:');
    expect(row?.status).toBe('warn');
    expect(row?.detail).toMatch(/re-baseline/);
  });

  it('treats a watchlist package missing from the baseline as ideal (1 copy)', () => {
    const { mermaid: _dropped, ...watchlist } = baselineFixture.watchlist;
    const results = compare(
      { ...baselineFixture, watchlist },
      currentFrom({ watchlist: { ...baselineFixture.watchlist, mermaid: 2 } })
    );
    expect(rowFor(results, 'mermaid:')?.status).toBe('fail');
  });

  it('applies the install-closure band, not the package band, to the closure', () => {
    // +30 MB is inside the old max(5%, 5 MB) rule and inside the package band,
    // but outside the 1% closure band — this is the regression the redesign
    // exists to catch.
    const results = compare(
      baselineFixture,
      currentFrom({
        installClosureBytes: baselineFixture.installClosureBytes + 30 * MB,
      })
    );
    expect(rowFor(results, 'du -sk node_modules')?.status).toBe('fail');
  });

  it('applies the admin-output band to the admin bundle', () => {
    const results = compare(
      baselineFixture,
      currentFrom({
        adminOutput: {
          totalBytes: baselineFixture.adminOutput.totalBytes + 1 * MB,
        },
      })
    );
    expect(rowFor(results, 'public/admin total')?.status).toBe('fail');
  });

  it('fails a small package that grows past the absolute floor', () => {
    const results = compare(
      baselineFixture,
      currentFrom({
        packages: { ...baselineFixture.packages, 'pkg-a': 100 * KB + 30 * KB },
      })
    );
    expect(rowFor(results, 'pkg-a:')?.status).toBe('fail');
  });

  it('warns rather than fails when a package stops being packed', () => {
    const results = compare(
      baselineFixture,
      currentFrom({ packages: { 'pkg-b': 4 * MB } })
    );
    const row = rowFor(results, 'pkg-a:');
    expect(row?.status).toBe('warn');
    expect(row?.detail).toMatch(/no longer packed/);
  });

  it('warns rather than fails on a package with no baseline', () => {
    const results = compare(
      baselineFixture,
      currentFrom({
        packages: { ...baselineFixture.packages, 'pkg-new': 900 * MB },
      })
    );
    expect(rowFor(results, 'pkg-new:')?.status).toBe('warn');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// unpackedSizeOfTarball — the hand-rolled tar parser standing in for
// `npm pack --dry-run --json`'s unpackedSize
// ─────────────────────────────────────────────────────────────────────────────

const tmpDirs: string[] = [];
afterAll(() => {
  for (const d of tmpDirs) fs.rmSync(d, { recursive: true, force: true });
});

function mkTmp(): string {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'size-baseline-test-'));
  tmpDirs.push(d);
  return d;
}

/** Minimal ustar header + payload, padded to the 512-byte record size. */
function tarEntry(name: string, body: Buffer, typeflag = '0'): Buffer {
  const header = Buffer.alloc(512);
  header.write(name, 0, 100, 'utf8');
  header.write('000644 \0', 100, 8, 'utf8');
  header.write('000000 \0', 108, 8, 'utf8');
  header.write('000000 \0', 116, 8, 'utf8');
  header.write(
    `${body.length.toString(8).padStart(11, '0')}\0`,
    124,
    12,
    'utf8'
  );
  header.write('00000000000\0', 136, 12, 'utf8');
  header.write('        ', 148, 8, 'utf8'); // checksum placeholder
  header.write(typeflag, 156, 1, 'utf8');
  header.write('ustar\0', 257, 6, 'utf8');
  header.write('00', 263, 2, 'utf8');
  let sum = 0;
  for (const b of header) sum += b;
  header.write(`${sum.toString(8).padStart(6, '0')}\0 `, 148, 8, 'utf8');
  const padding = Buffer.alloc((512 - (body.length % 512)) % 512);
  return Buffer.concat([header, body, padding]);
}

const endOfArchive = Buffer.alloc(1024);

function writeTgz(entries: Buffer[]): string {
  const file = path.join(mkTmp(), 'fixture.tgz');
  fs.writeFileSync(file, gzipSync(Buffer.concat([...entries, endOfArchive])));
  return file;
}

describe('unpackedSizeOfTarball', () => {
  it('sums regular-file sizes', () => {
    const tgz = writeTgz([
      tarEntry('package/index.js', Buffer.alloc(1000, 0x61)),
      tarEntry('package/README.md', Buffer.alloc(24, 0x62)),
    ]);
    expect(unpackedSizeOfTarball(tgz)).toBe(1024);
  });

  it('handles payloads that are not a multiple of the 512-byte record', () => {
    // A mis-stepped offset here would mis-parse every following header, so the
    // total is the check that the padding walk is right.
    const tgz = writeTgz([
      tarEntry('package/a.js', Buffer.alloc(1, 0x61)),
      tarEntry('package/b.js', Buffer.alloc(513, 0x62)),
      tarEntry('package/c.js', Buffer.alloc(511, 0x63)),
    ]);
    expect(unpackedSizeOfTarball(tgz)).toBe(1 + 513 + 511);
  });

  it('counts the legacy NUL typeflag as a regular file', () => {
    const tgz = writeTgz([
      tarEntry('package/old.js', Buffer.alloc(100, 0x61), '\0'),
    ]);
    expect(unpackedSizeOfTarball(tgz)).toBe(100);
  });

  it('ignores directories, symlinks and pax/longname metadata entries', () => {
    const tgz = writeTgz([
      tarEntry('package/dist/', Buffer.alloc(0), '5'),
      tarEntry('package/link.js', Buffer.alloc(0), '2'),
      tarEntry('PaxHeaders/package/x.js', Buffer.alloc(64, 0x20), 'x'),
      tarEntry('././@LongLink', Buffer.alloc(200, 0x2f), 'L'),
      tarEntry('package/real.js', Buffer.alloc(777, 0x61)),
    ]);
    expect(unpackedSizeOfTarball(tgz)).toBe(777);
  });

  it('stops at the end-of-archive marker and ignores trailing padding', () => {
    const file = path.join(mkTmp(), 'padded.tgz');
    fs.writeFileSync(
      file,
      gzipSync(
        Buffer.concat([
          tarEntry('package/a.js', Buffer.alloc(50, 0x61)),
          endOfArchive,
          // Some writers pad the archive out to a block factor; anything after
          // the zero block must not be counted.
          Buffer.alloc(10240),
        ])
      )
    );
    expect(unpackedSizeOfTarball(file)).toBe(50);
  });

  it('returns 0 for an archive with no entries', () => {
    expect(unpackedSizeOfTarball(writeTgz([]))).toBe(0);
  });

  it('matches the real file sizes in a tarball produced by tar(1)', () => {
    // The hand-built headers above test the parser against the spec; this one
    // tests it against whatever the platform's tar actually emits (bsdtar on
    // macOS, GNU tar on the ubuntu runners), including its long-path encoding.
    const dir = mkTmp();
    const src = path.join(dir, 'package');
    const deep = path.join(
      src,
      'dist',
      'a-deliberately-long-directory-name-to-push-past-the-ustar-100-character-name-field'
    );
    fs.mkdirSync(deep, { recursive: true });
    const files: Record<string, number> = {
      [path.join(src, 'package.json')]: 137,
      [path.join(src, 'README.md')]: 4096,
      [path.join(deep, 'index.js')]: 12345,
    };
    for (const [file, size] of Object.entries(files)) {
      fs.writeFileSync(file, Buffer.alloc(size, 0x61));
    }
    const tgz = path.join(dir, 'pkg.tgz');
    // COPYFILE_DISABLE stops macOS bsdtar adding AppleDouble entries for
    // extended attributes, which no real npm tarball contains (npm packs with
    // the JS `tar` package). Ignored by GNU tar.
    execFileSync('tar', ['-czf', tgz, '-C', dir, 'package'], {
      env: { ...process.env, COPYFILE_DISABLE: '1' },
    });

    const expected = Object.values(files).reduce((a, b) => a + b, 0);
    expect(unpackedSizeOfTarball(tgz)).toBe(expected);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// fixture lockfile helpers
// ─────────────────────────────────────────────────────────────────────────────

describe('isWorkspacePackageName', () => {
  it.each([
    'tinacms',
    '@tinacms/cli',
    '@tinacms/app',
    'tinacms-authjs',
    'tinacms-clerk',
    'create-tina-app',
    'next-tinacms-s3',
  ])('matches the published workspace package %s', (name) => {
    expect(isWorkspacePackageName(name)).toBe(true);
  });

  it.each([
    'react',
    'graphql',
    '@types/react',
    '@monaco-editor/react',
    'tinacomsx',
    '@tinacmsfoo/bar',
    'my-tinacms',
  ])('does not match the third-party package %s', (name) => {
    expect(isWorkspacePackageName(name)).toBe(false);
  });
});

describe('lockKeyPackageNames', () => {
  it('reads every nesting level, scoped names included', () => {
    expect(lockKeyPackageNames('node_modules/@tinacms/mdx')).toEqual([
      '@tinacms/mdx',
    ]);
    expect(
      lockKeyPackageNames('node_modules/@tinacms/mdx/node_modules/typescript')
    ).toEqual(['@tinacms/mdx', 'typescript']);
    expect(lockKeyPackageNames('node_modules/a/node_modules/@scope/b')).toEqual(
      ['a', '@scope/b']
    );
    expect(lockKeyPackageNames('')).toEqual([]);
  });
});

describe('stripWorkspaceEntries', () => {
  const lock = {
    lockfileVersion: 3,
    name: 'size-fixture',
    packages: {
      '': { name: 'size-fixture', dependencies: { tinacms: 'latest' } },
      'node_modules/astro': {
        version: '7.0.6',
        resolved: 'http://localhost:4873/astro/-/astro-7.0.6.tgz',
      },
      'node_modules/tinacms': { version: '3.11.0' },
      'node_modules/@tinacms/mdx': { version: '1.0.0' },
      // Nested under a workspace package — must go with its parent, or npm
      // loads a lockfile entry whose parent no longer exists.
      'node_modules/@tinacms/mdx/node_modules/typescript': { version: '5.6.3' },
      // Nested under a third-party package — this is exactly the kind of pin
      // that keeps the watchlist counts stable, so it must survive.
      'node_modules/@graphql-codegen/core/node_modules/lodash': {
        version: '4.17.21',
      },
    },
  };

  it('drops workspace packages and everything nested under them', () => {
    const out = stripWorkspaceEntries(lock);
    expect(Object.keys(out.packages).sort()).toEqual([
      '',
      'node_modules/@graphql-codegen/core/node_modules/lodash',
      'node_modules/astro',
    ]);
  });

  it('keeps the root entry and its declared dependencies', () => {
    expect(stripWorkspaceEntries(lock).packages['']).toEqual(lock.packages['']);
  });

  it('normalises resolved hosts to the public registry', () => {
    expect(
      stripWorkspaceEntries(lock).packages['node_modules/astro'].resolved
    ).toBe('https://registry.npmjs.org/astro/-/astro-7.0.6.tgz');
  });

  it('does not mutate the input', () => {
    const snapshot = JSON.stringify(lock);
    stripWorkspaceEntries(lock);
    expect(JSON.stringify(lock)).toBe(snapshot);
  });

  it('leaves the committed fixture lockfile unchanged (it is already stripped)', () => {
    const committed = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, 'size-fixture', 'package-lock.fixture.json'),
        'utf-8'
      )
    );
    expect(stripWorkspaceEntries(committed)).toEqual(committed);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// writeStepSummary — the numbers have to reach the PR, not just the raw log
// ─────────────────────────────────────────────────────────────────────────────

describe('writeStepSummary', () => {
  const GROUPS = ['install closure', 'watchlist', 'admin output', 'packages'];
  const results = [
    { group: 'install closure', status: 'ok', detail: 'du -sk: 933.24 MB' },
    { group: 'watchlist', status: 'warn', detail: 'typescript: 2 copies' },
    { group: 'admin output', status: 'fail', detail: 'public/admin: +12 MB' },
    { group: 'packages', status: 'ok', detail: 'tinacms: 3.80 MB' },
    { group: 'packages', status: 'ok', detail: '@tinacms/cli: 1.20 MB' },
    { group: 'packages', status: 'fail', detail: '@tinacms/mdx: +900 KB' },
  ];

  function render(counts) {
    const file = path.join(
      fs.mkdtempSync(path.join(os.tmpdir(), 'size-summary-')),
      'summary.md'
    );
    const prev = process.env.GITHUB_STEP_SUMMARY;
    process.env.GITHUB_STEP_SUMMARY = file;
    try {
      writeStepSummary(results, GROUPS, {
        failed: 0,
        warned: 0,
        seconds: '12.3',
        ...counts,
      });
    } finally {
      if (prev === undefined) delete process.env.GITHUB_STEP_SUMMARY;
      else process.env.GITHUB_STEP_SUMMARY = prev;
    }
    return fs.readFileSync(file, 'utf-8');
  }

  it('is a no-op outside GitHub Actions', () => {
    const prev = process.env.GITHUB_STEP_SUMMARY;
    delete process.env.GITHUB_STEP_SUMMARY;
    try {
      expect(() =>
        writeStepSummary(results, GROUPS, {
          failed: 0,
          warned: 0,
          seconds: '1.0',
        })
      ).not.toThrow();
    } finally {
      if (prev !== undefined) process.env.GITHUB_STEP_SUMMARY = prev;
    }
  });

  it('leads with a red verdict when anything failed', () => {
    expect(render({ failed: 2, warned: 1 })).toContain(
      '## 🔴 Size baseline — 2 failing, 1 warning'
    );
  });

  it('leads with amber on warnings alone and green on a clean run', () => {
    expect(render({ warned: 1 })).toContain('## 🟡 Size baseline');
    expect(render({})).toContain('## 🟢 Size baseline');
  });

  it('renders every non-packages row, including green ones', () => {
    const md = render({ failed: 2, warned: 1 });
    expect(md).toContain('| 🟢 | install closure | du -sk: 933.24 MB |');
    expect(md).toContain('| 🟡 | watchlist | typescript: 2 copies |');
    expect(md).toContain('| 🔴 | admin output | public/admin: +12 MB |');
  });

  it('collapses green package rows to a count but keeps the failures', () => {
    const md = render({ failed: 2, warned: 1 });
    expect(md).toContain('| 🔴 | packages | @tinacms/mdx: +900 KB |');
    expect(md).toContain('| 🟢 | packages | 2 package(s) within tolerance |');
    expect(md).not.toContain('tinacms: 3.80 MB');
  });

  it('appends rather than truncating — Actions shares the file across steps', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'size-summary-'));
    const file = path.join(dir, 'summary.md');
    fs.writeFileSync(file, 'earlier step output\n');
    const prev = process.env.GITHUB_STEP_SUMMARY;
    process.env.GITHUB_STEP_SUMMARY = file;
    try {
      writeStepSummary(results, GROUPS, {
        failed: 0,
        warned: 0,
        seconds: '1.0',
      });
    } finally {
      if (prev === undefined) delete process.env.GITHUB_STEP_SUMMARY;
      else process.env.GITHUB_STEP_SUMMARY = prev;
    }
    expect(fs.readFileSync(file, 'utf-8')).toMatch(/^earlier step output\n/);
  });
});
