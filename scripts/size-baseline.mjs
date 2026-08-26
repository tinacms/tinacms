#!/usr/bin/env node
// @ts-check
/**
 * size-baseline.mjs — per-PR install/tarball/bundle budgets + duplicate-copy watchlist.
 *
 * Measures four metrics against tests/size-baselines.json and fails on regression:
 *
 *   1. installClosureBytes    - `du -sk node_modules` of the npm-installed fixture
 *      (tests/size-fixture). Real npm on purpose: npm's nested-duplicate hoisting
 *      is the failure mode this job guards; pnpm's content-addressed store hides it.
 *   2. watchlist              - physical copy-count per watchlist package; any
 *      increase over baseline fails, with no tolerance band (see compare()).
 *   3. packages               - unpacked size of every publishable workspace
 *      package (discovered the same way tests/build-verification.test.ts does).
 *   4. adminOutput.totalBytes - kitchen-sink public/admin after `tinacms build`.
 *      (An object so #7245/#7246 can split it into shell + project budgets
 *      without a shape change.)
 *
 * Usage:
 *   node scripts/size-baseline.mjs                       # check against baseline (verdaccio)
 *   node scripts/size-baseline.mjs --update              # regenerate the baseline JSON
 *   node scripts/size-baseline.mjs --registry-mode=real  # cron: install from real npm
 *
 * Baselines MUST be generated in CI: `du` block accounting and platform-optional
 * binaries differ per OS, so a dev-machine baseline can never match ubuntu-latest.
 * Dispatch the "Size Baseline" workflow with `update_size_baseline: true` and
 * commit the `size-baselines` artifact it uploads.
 *
 * Prerequisite: `pnpm build` - metrics 3 and 4 read built dist output.
 *
 * Verdaccio limitation (documented on purpose, per #7238): the default mode packs
 * the CURRENT workspace, publishes it into a throwaway verdaccio registry and
 * installs the fixture from there. That reproduces npm's resolution of this PR's
 * code but NOT registry history - a stale already-published version can nest
 * duplicate copies that verdaccio, seeded only from HEAD, can never surface. The
 * weekly cron's --registry-mode=real installs straight from npmjs to cover that
 * class. Its numbers legitimately drift from the verdaccio baseline, so treat
 * cron failures as a canary to investigate, not necessarily a regression in the
 * current diff.
 */

import { execFileSync, spawn } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const FIXTURE_DIR = path.join(ROOT, 'tests', 'size-fixture');
// Two paths on purpose. npm only reads/writes `package-lock.json`, so that name
// is transient: staged before the install, deleted after. The committed pins live
// in `package-lock.fixture.json` - a name dependency-review does NOT recognise.
// Committed as package-lock.json, the fixture's ~1400-entry closure reads as
// newly-introduced dependencies and every advisory anywhere in it fails the PR
// (see tests/size-fixture/.gitignore).
const FIXTURE_LOCK_PATH = path.join(FIXTURE_DIR, 'package-lock.json');
const COMMITTED_LOCK_PATH = path.join(FIXTURE_DIR, 'package-lock.fixture.json');
const BASELINE_PATH = path.join(ROOT, 'tests', 'size-baselines.json');
const ADMIN_DIR = path.join(
  ROOT,
  'examples',
  'next',
  'kitchen-sink',
  'public',
  'admin'
);

// Name patterns for packages published from THIS workspace. Two consumers:
// verdaccio serves them locally with no npmjs proxy (so the fixture resolves
// the current workspace, not whatever is on npm), and the committed fixture
// lockfile deliberately omits them (see stripWorkspaceEntries).
const LOCAL_PKG_GLOBS = [
  '@tinacms/*',
  'tinacms',
  'tinacms-*',
  'create-tina-app',
  'next-tinacms-*',
];

/** @param {string} name */
export function isWorkspacePackageName(name) {
  return LOCAL_PKG_GLOBS.some((glob) =>
    new RegExp(
      `^${glob.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')}$`
    ).test(name)
  );
}

// Packages whose duplicate physical copies are the documented failure mode.
const WATCHLIST = [
  'tinacms',
  'mermaid',
  'date-fns',
  'typescript',
  'react',
  'graphql',
  'lodash',
];

/**
 * Per-metric tolerance bands. A metric fails when it exceeds
 * `baseline + max(baseline * pct, abs)`.
 *
 * One global band cannot serve metrics spanning five orders of magnitude: an
 * absolute floor big enough for the ~GB closure lets a 16 KB tarball grow
 * hundreds-fold unnoticed, and a percentage tight enough for the closure fails
 * small tarballs on a README edit. Each band is sized for what its metric
 * exists to catch: the closure's 1% fires on a mid-size dependency entering
 * the tree (typescript, monaco, a nested tinacms copy), adminOutput's on a
 * re-bundled lazy chunk (#7245/#7246), and the package floor on a dependency
 * getting bundled in rather than a source edit. tests/size-baseline.test.ts
 * asserts these properties against the committed baseline.
 *
 * @type {Record<'installClosure'|'adminOutput'|'package', {pct:number, abs:number}>}
 */
export const TOLERANCES = {
  installClosure: { pct: 0.01, abs: 5 * 1024 * 1024 },
  adminOutput: { pct: 0.05, abs: 250 * 1024 },
  package: { pct: 0.05, abs: 25 * 1024 },
};

// A decrease warns only to prompt `pnpm size:update` so wins get locked in;
// deliberately looser than the fail bands so it does not fire on every
// dead-code removal.
const WARN_DECREASE_PCT = 0.1;

const VERDACCIO_VERSION = '6';
const VERDACCIO_PORT = Number(process.env.SIZE_VERDACCIO_PORT || 4873);
const VERDACCIO_URL = `http://localhost:${VERDACCIO_PORT}/`;
const REAL_REGISTRY_URL = 'https://registry.npmjs.org/';

// ── CLI args ─────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const UPDATE = args.includes('--update');
const registryModeArg = args.find((a) => a.startsWith('--registry-mode='));
const REGISTRY_MODE = registryModeArg
  ? registryModeArg.split('=')[1]
  : 'verdaccio';
// Validated in main() rather than here so importing this module (tests) can
// never call process.exit.

// ── small utils ──────────────────────────────────────────────────────────────
function log(msg) {
  console.log(`[size-baseline] ${msg}`);
}
function fail(msg) {
  console.error(`[size-baseline] ERROR: ${msg}`);
  process.exit(1);
}
function run(cmd, cmdArgs, opts = {}) {
  return execFileSync(cmd, cmdArgs, {
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
    ...opts,
  });
}
function fmtBytes(n) {
  if (n == null) return 'n/a';
  const mb = n / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(2)} MB`;
  return `${(n / 1024).toFixed(1)} KB`;
}

// ── package discovery (mirrors tests/build-verification.test.ts) ──────────────
function collectPackagesFromDir(dir, skipAt = false) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir)) {
    if (skipAt && entry.startsWith('@')) continue;
    const pkgJsonPath = path.join(dir, entry, 'package.json');
    if (!fs.existsSync(pkgJsonPath)) continue;
    const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
    if (pkg.private === true) continue;
    results.push({ name: pkg.name, pkgDir: path.dirname(pkgJsonPath) });
  }
  return results;
}
function discoverPackages() {
  return [
    ...collectPackagesFromDir(path.join(ROOT, 'packages/@tinacms')),
    ...collectPackagesFromDir(path.join(ROOT, 'packages'), true),
  ].sort((a, b) => a.name.localeCompare(b.name));
}

// ── tarball unpacked-size (sum of regular-file entry sizes, like npm) ─────────
export function unpackedSizeOfTarball(tgzPath) {
  const buf = gunzipSync(fs.readFileSync(tgzPath));
  let off = 0;
  let total = 0;
  while (off + 512 <= buf.length) {
    const header = buf.subarray(off, off + 512);
    if (header.every((b) => b === 0)) break;
    const name = header.subarray(0, 100).toString('utf8').replace(/\0.*$/, '');
    const size =
      Number.parseInt(
        header.subarray(124, 136).toString('utf8').replace(/\0.*$/, '').trim(),
        8
      ) || 0;
    const typeflag = String.fromCharCode(header[156]);
    if (name && (typeflag === '0' || typeflag === '\0' || typeflag === '')) {
      total += size;
    }
    off += 512 + Math.ceil(size / 512) * 512;
  }
  return total;
}

// ── recursive byte sum of a directory (deterministic, filesystem-independent) ─
function dirBytes(dir) {
  let total = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) total += dirBytes(p);
    else if (entry.isFile()) total += fs.statSync(p).size;
  }
  return total;
}

// ── guard: dist must exist (pnpm build) ──────────────────────────────────────
function assertBuilt() {
  const sentinels = [
    path.join(ROOT, 'packages', 'tinacms', 'dist'),
    path.join(ROOT, 'packages', '@tinacms', 'cli', 'dist'),
  ];
  for (const s of sentinels) {
    if (!fs.existsSync(s)) {
      fail(
        `${path.relative(ROOT, s)} not found — run \`pnpm build\` before size:check`
      );
    }
  }
}

// ── metric 3: pack every publishable package, record unpackedSize + tarball ───
function packAll(tarballDir) {
  const packages = discoverPackages();
  log(`packing ${packages.length} publishable packages…`);
  /** @type {{name:string,tarball:string,unpackedSize:number}[]} */
  const packed = [];
  for (const { name, pkgDir } of packages) {
    // pnpm pack resolves `workspace:` protocols exactly like publish does.
    const out = run(
      'pnpm',
      ['pack', '--pack-destination', tarballDir, '--json'],
      { cwd: pkgDir }
    );
    const info = JSON.parse(out);
    const tarball = info.filename;
    if (!tarball || !fs.existsSync(tarball)) {
      fail(`pnpm pack produced no tarball for ${name}`);
    }
    packed.push({
      name,
      tarball,
      unpackedSize: unpackedSizeOfTarball(tarball),
    });
  }
  return packed;
}

// ── verdaccio: ephemeral registry, anonymous publish, npmjs uplink ────────────
function writeVerdaccioConfig(dir) {
  const cfgPath = path.join(dir, 'verdaccio.yaml');
  // Local packages get NO `proxy` - verdaccio serves only what we publish, so
  // the fixture resolves the CURRENT workspace, never npm's published copy.
  // Everything else proxies npmjs uncached (the pins make a cache pure
  // bandwidth, and it would live in a per-run tmpdir anyway).
  const localPkgBlock = LOCAL_PKG_GLOBS.map(
    (glob) => `  '${glob}':
    access: $all
    publish: $anonymous
    unpublish: $anonymous`
  ).join('\n');
  const cfg = `storage: ${path.join(dir, 'storage')}
auth:
  htpasswd:
    file: ${path.join(dir, 'htpasswd')}
    max_users: -1
uplinks:
  npmjs:
    url: ${REAL_REGISTRY_URL}
    cache: false
    timeout: 60s
packages:
${localPkgBlock}
  '**':
    access: $all
    publish: $anonymous
    proxy: npmjs
log: { type: stdout, format: pretty, level: warn }
`;
  fs.writeFileSync(cfgPath, cfg);
  return cfgPath;
}

async function waitForPort(url, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 404) return;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`verdaccio did not become ready at ${url}`);
}

async function startVerdaccio(workDir) {
  const cfgPath = writeVerdaccioConfig(workDir);
  log(`starting verdaccio@${VERDACCIO_VERSION} on ${VERDACCIO_URL}…`);
  const logStream = fs.openSync(path.join(workDir, 'verdaccio.log'), 'a');
  const child = spawn(
    'pnpm',
    [
      'dlx',
      `verdaccio@${VERDACCIO_VERSION}`,
      '--config',
      cfgPath,
      '--listen',
      String(VERDACCIO_PORT),
    ],
    { cwd: workDir, detached: true, stdio: ['ignore', logStream, logStream] }
  );
  child.unref();
  await waitForPort(`${VERDACCIO_URL}-/ping`, 120000);
  log('verdaccio ready');
  return child;
}

function stopVerdaccio(child) {
  if (!child || child.killed) return;
  try {
    // detached => negative pid kills the whole process group (dlx + node).
    process.kill(-child.pid, 'SIGTERM');
  } catch {
    try {
      child.kill('SIGTERM');
    } catch {
      // already gone
    }
  }
}

function publishAll(packed, workDir) {
  // Temp userconfig with a dummy token — verdaccio allows anonymous publish but
  // npm still wants *a* token present for the registry.
  const npmrc = path.join(workDir, 'publish.npmrc');
  fs.writeFileSync(
    npmrc,
    `registry=${VERDACCIO_URL}\n//localhost:${VERDACCIO_PORT}/:_authToken=size-baseline-anon\n`
  );
  log(`publishing ${packed.length} tarballs to verdaccio…`);
  for (const { name, tarball } of packed) {
    try {
      run('npm', ['publish', tarball, '--registry', VERDACCIO_URL], {
        env: { ...process.env, npm_config_userconfig: npmrc },
        stdio: ['ignore', 'ignore', 'pipe'],
      });
    } catch (err) {
      const stderr = String(err.stderr || '');
      // Re-publishing the same version is fine on a re-run.
      if (
        !/EPUBLISHCONFLICT|previously published|cannot publish over/i.test(
          stderr
        )
      ) {
        fail(`npm publish failed for ${name}:\n${stderr}`);
      }
    }
  }
}

// ── fixture lockfile ──────────────────────────────────────────────────────────
//
// The committed pins keep the install closure and the zero-tolerance watchlist
// counts from moving on upstream point releases that have nothing to do with
// the PR's diff. Two deliberate shapes:
//
//  1. `npm ci` is NOT used, and the workspace's own packages are NOT pinned.
//     Their tarballs are rebuilt from HEAD every run, so their integrity hashes
//     change on exactly the commits this job runs on - pinning them (or
//     `npm ci`, which verifies every entry) would fail essentially every PR.
//     They are stripped and re-resolved each run: they are the code under test.
//     Everything they pull in stays pinned.
//  2. `resolved` URLs are normalised to the public registry; the fixture
//     .npmrc's replace-registry-host redirects them to whichever registry the
//     run uses, so one lockfile serves both modes without churn.

/** @param {string} key an npm lockfile `packages` key, e.g. `node_modules/a/node_modules/b` */
export function lockKeyPackageNames(key) {
  const names = [];
  const parts = key.split('/');
  for (let i = 0; i < parts.length; i++) {
    if (parts[i] !== 'node_modules') continue;
    const next = parts[i + 1];
    if (!next) continue;
    names.push(next.startsWith('@') ? `${next}/${parts[i + 2] ?? ''}` : next);
  }
  return names;
}

/**
 * Drop every entry that is — or lives underneath — a workspace package, and
 * normalise registry hosts. Returns a new lockfile object.
 */
export function stripWorkspaceEntries(lock) {
  if (lock.lockfileVersion < 3) {
    fail(
      `fixture lockfileVersion ${lock.lockfileVersion} is unsupported — regenerate with npm 11 (\`pnpm size:update\`)`
    );
  }
  const packages = {};
  for (const [key, entry] of Object.entries(lock.packages ?? {})) {
    if (lockKeyPackageNames(key).some(isWorkspacePackageName)) continue;
    if (typeof entry.resolved === 'string') {
      packages[key] = {
        ...entry,
        resolved: entry.resolved.replace(
          /^https?:\/\/[^/]+\//,
          REAL_REGISTRY_URL
        ),
      };
    } else {
      packages[key] = entry;
    }
  }
  return { ...lock, packages };
}

/** Committed lockfile contents, or null when it has never been seeded. */
function readCommittedLock() {
  return fs.existsSync(COMMITTED_LOCK_PATH)
    ? fs.readFileSync(COMMITTED_LOCK_PATH, 'utf8')
    : null;
}

/** Stage pins where npm will actually look for them. */
function writeFixtureLock(lock) {
  fs.writeFileSync(FIXTURE_LOCK_PATH, `${JSON.stringify(lock, null, 2)}\n`);
}

/** Regenerate the committed lockfile from whatever npm just resolved. */
function updateCommittedLock() {
  const generated = JSON.parse(fs.readFileSync(FIXTURE_LOCK_PATH, 'utf8'));
  fs.writeFileSync(
    COMMITTED_LOCK_PATH,
    `${JSON.stringify(stripWorkspaceEntries(generated), null, 2)}\n`
  );
  log(`wrote ${path.relative(ROOT, COMMITTED_LOCK_PATH)}`);
}

// ── fixture install + measurement ─────────────────────────────────────────────
/** Removes the installed tree. The committed lockfile is NOT deleted. */
function cleanFixture() {
  fs.rmSync(path.join(FIXTURE_DIR, 'node_modules'), {
    recursive: true,
    force: true,
  });
}

function installFixture() {
  const registry = REGISTRY_MODE === 'real' ? REAL_REGISTRY_URL : VERDACCIO_URL;
  log(`npm install fixture against ${registry} …`);
  run(
    'npm',
    [
      'install',
      '--registry',
      registry,
      '--no-audit',
      '--no-fund',
      '--loglevel',
      'error',
    ],
    { cwd: FIXTURE_DIR, stdio: ['ignore', 'ignore', 'inherit'] }
  );
}

function measureInstallClosureBytes() {
  const out = run('du', ['-sk', 'node_modules'], { cwd: FIXTURE_DIR });
  const kb = Number.parseInt(out.trim().split(/\s+/)[0], 10);
  return kb * 1024;
}

function measureWatchlistCopies() {
  // "Physical copy" = a real directory whose package.json `name` matches - read
  // the name, not the dir basename, so @types/react or @monaco-editor/react are
  // never mistaken for the bare package. The spec's `npm ls --all --json`
  // counts logical dependency EDGES instead, which lists one hoisted react once
  // per dependent and wildly overcounts. The walk stays inside node_modules
  // subtrees, so it is bounded even on a ~1 GB install.
  const counts = {};
  for (const name of WATCHLIST) counts[name] = 0;
  const watch = new Set(WATCHLIST);

  const handlePkgDir = (dir) => {
    let stat;
    try {
      stat = fs.lstatSync(dir);
    } catch {
      return;
    }
    if (!stat.isDirectory()) return; // skip symlinks/files
    const pj = path.join(dir, 'package.json');
    if (fs.existsSync(pj)) {
      try {
        const name = JSON.parse(fs.readFileSync(pj, 'utf8')).name;
        if (watch.has(name)) counts[name]++;
      } catch {
        // unreadable/partial package.json — not a countable copy
      }
    }
    const nested = path.join(dir, 'node_modules');
    if (fs.existsSync(nested)) walkNodeModules(nested);
  };

  const walkNodeModules = (nmDir) => {
    let entries;
    try {
      entries = fs.readdirSync(nmDir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      if (e.name === '.bin' || e.name.startsWith('.')) continue;
      const full = path.join(nmDir, e.name);
      if (e.name.startsWith('@')) {
        // Scope directory — recurse into each scoped package.
        let scoped;
        try {
          scoped = fs.readdirSync(full, { withFileTypes: true });
        } catch {
          continue;
        }
        for (const s of scoped) handlePkgDir(path.join(full, s.name));
      } else {
        handlePkgDir(full);
      }
    }
  };

  walkNodeModules(path.join(FIXTURE_DIR, 'node_modules'));
  return counts;
}

// `tinacms build --local` starts the datalayer GraphQL server on port 9000 and
// does not always release it promptly, which makes fast local reruns collide.
// Best-effort and posix-only (the CI job is ubuntu-only).
const DATALAYER_PORT = 9000;
function freeDatalayerPort() {
  if (process.platform === 'win32') return;
  let pids = '';
  try {
    pids = execFileSync('lsof', ['-ti', `tcp:${DATALAYER_PORT}`], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    return; // nothing listening (lsof exits non-zero) — nothing to do
  }
  const list = pids
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
  if (!list.length) return;
  log(
    `freeing stale datalayer server on port ${DATALAYER_PORT} (pid ${list.join(', ')})`
  );
  for (const pid of list) {
    try {
      process.kill(Number(pid), 'SIGKILL');
    } catch {
      // already gone
    }
  }
}

function buildAdminOutput() {
  freeDatalayerPort();
  log('building kitchen-sink admin output (tinacms build --local)…');
  run(
    'pnpm',
    [
      '--filter',
      '@examples/next-kitchen-sink',
      'exec',
      'tinacms',
      'build',
      '--local',
      '--skip-cloud-checks',
    ],
    { cwd: ROOT, stdio: ['ignore', 'ignore', 'inherit'] }
  );
  if (!fs.existsSync(ADMIN_DIR)) {
    fail(`admin output not found at ${path.relative(ROOT, ADMIN_DIR)}`);
  }
  return dirBytes(ADMIN_DIR);
}

// ── measurement orchestration ─────────────────────────────────────────────────
async function measure() {
  assertBuilt();
  const committedLock = readCommittedLock();
  if (committedLock == null && !UPDATE) {
    fail(
      `${path.relative(ROOT, COMMITTED_LOCK_PATH)} not found — run \`pnpm size:update\` to seed it`
    );
  }
  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'size-baseline-'));
  const tarballDir = path.join(workDir, 'tarballs');
  fs.mkdirSync(tarballDir, { recursive: true });
  let verdaccio = null;
  try {
    const packed = packAll(tarballDir);

    if (REGISTRY_MODE === 'verdaccio') {
      verdaccio = await startVerdaccio(workDir);
      publishAll(packed, workDir);
    } else {
      log('registry-mode=real — skipping verdaccio; installing from npmjs');
    }

    cleanFixture();
    // `size:update` keeps the existing pins - only what the diff moved gets a
    // new pin. Delete the lockfile by hand for a deliberate upgrade-everything
    // re-pin.
    if (committedLock != null) {
      writeFixtureLock(stripWorkspaceEntries(JSON.parse(committedLock)));
    }
    installFixture();
    if (UPDATE) updateCommittedLock();
    const installClosureBytes = measureInstallClosureBytes();
    const watchlist = measureWatchlistCopies();

    const adminTotalBytes = buildAdminOutput();

    const packages = {};
    for (const { name, unpackedSize } of packed) packages[name] = unpackedSize;

    return {
      installClosureBytes,
      watchlist,
      packages,
      adminOutput: { totalBytes: adminTotalBytes },
    };
  } finally {
    stopVerdaccio(verdaccio);
    // SIZE_KEEP_INSTALL leaves the fixture node_modules in place for debugging.
    if (!process.env.SIZE_KEEP_INSTALL) cleanFixture();
    // package-lock.json is staging, never a tracked file - drop it so no run
    // leaves a manifest behind for a scanner to find and the tree stays clean.
    fs.rmSync(FIXTURE_LOCK_PATH, { force: true });
    fs.rmSync(workDir, { recursive: true, force: true });
  }
}

// ── baseline I/O ──────────────────────────────────────────────────────────────
function readBaseline() {
  if (!fs.existsSync(BASELINE_PATH)) {
    fail(
      `${path.relative(ROOT, BASELINE_PATH)} not found — run \`pnpm size:update\` to seed it`
    );
  }
  return JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'));
}

function writeBaseline(metrics) {
  const doc = {
    _comment:
      'Generated by scripts/size-baseline.mjs — do not edit by hand. Run `pnpm size:update` to regenerate. Sizes are in bytes. watchlist is the physical copy-count of each package; the ideal is 1 and the check fails on any increase above these values (pre-existing >1 entries are surfaced as warnings to drive back down).',
    installClosureBytes: metrics.installClosureBytes,
    watchlist: metrics.watchlist,
    packages: metrics.packages,
    adminOutput: metrics.adminOutput,
  };
  fs.writeFileSync(BASELINE_PATH, `${JSON.stringify(doc, null, 2)}\n`);
  log(`wrote ${path.relative(ROOT, BASELINE_PATH)}`);
}

// ── tolerance engine ──────────────────────────────────────────────────────────
/**
 * @param {string} label
 * @param {number|null|undefined} baseline
 * @param {number} current
 * @param {{pct:number, abs:number}} tolerance
 * @returns {{status:'ok'|'fail'|'warn', detail:string}}
 */
export function compareScalar(label, baseline, current, tolerance) {
  if (baseline == null) {
    return { status: 'warn', detail: `${label}: no baseline (new metric)` };
  }
  const threshold =
    baseline + Math.max(baseline * tolerance.pct, tolerance.abs);
  const deltaBytes = current - baseline;
  const deltaPct = baseline === 0 ? 0 : (deltaBytes / baseline) * 100;
  const sign = deltaBytes >= 0 ? '+' : '';
  const line = `${label}: ${fmtBytes(current)} (baseline ${fmtBytes(baseline)}, ${sign}${fmtBytes(deltaBytes)} / ${sign}${deltaPct.toFixed(1)}%)`;
  if (current > threshold) {
    return {
      status: 'fail',
      detail: `${line} — exceeds threshold ${fmtBytes(threshold)}`,
    };
  }
  if (deltaPct <= -WARN_DECREASE_PCT * 100) {
    return {
      status: 'warn',
      detail: `${line} — dropped >10%, re-baseline to lock in the win (pnpm size:update)`,
    };
  }
  return { status: 'ok', detail: line };
}

// Mirror the console report into the Actions job summary, on green runs too - a
// number that has not tripped a threshold yet is one nobody reads in a raw log,
// which is how past drift went unnoticed. No-op outside Actions.
export function writeStepSummary(results, groups, { failed, warned, seconds }) {
  const target = process.env.GITHUB_STEP_SUMMARY;
  if (!target) return;

  const icon = { fail: '🔴', warn: '🟡', ok: '🟢' };
  const verdict = failed > 0 ? '🔴' : warned > 0 ? '🟡' : '🟢';
  const md = [
    `## ${verdict} Size baseline — ${failed} failing, ${warned} warning`,
    '',
    `registry-mode \`${REGISTRY_MODE}\` · ${seconds}s`,
    '',
    '| | Group | Detail |',
    '| :-: | --- | --- |',
  ];

  for (const group of groups) {
    const rows = results.filter((r) => r.group === group);
    // Same readability trade-off as the console: 23 green package rows would
    // bury the four that matter, so collapse them into a count.
    const shown =
      group === 'packages' ? rows.filter((r) => r.status !== 'ok') : rows;
    for (const r of shown) {
      md.push(`| ${icon[r.status]} | ${group} | ${r.detail} |`);
    }
    if (group === 'packages') {
      const okCount = rows.length - shown.length;
      md.push(`| 🟢 | packages | ${okCount} package(s) within tolerance |`);
    }
  }

  if (REGISTRY_MODE === 'real' && failed > 0) {
    md.push(
      '',
      '> Real-registry numbers can differ from the verdaccio baseline (published history); treat this as a canary to investigate.'
    );
  }

  fs.appendFileSync(target, `${md.join('\n')}\n`);
}

export function compare(baseline, current) {
  const results = [];

  results.push({
    group: 'install closure',
    ...compareScalar(
      'du -sk node_modules',
      baseline.installClosureBytes,
      current.installClosureBytes,
      TOLERANCES.installClosure
    ),
  });

  // Watchlist - zero tolerance on ANY increase in physical copies. Hard-failing
  // on a pre-existing >1 count would leave CI permanently red - the exact
  // rubber-stamp-the-re-baseline failure mode the spec (#7238) says to design
  // against - so the gate fails only when a count rises ABOVE its baseline,
  // and pre-existing duplicates surface as warnings until driven back to 1
  // and re-baselined.
  for (const name of WATCHLIST) {
    const base = baseline.watchlist?.[name] ?? 1;
    const count = current.watchlist[name] ?? 0;
    if (count > base) {
      results.push({
        group: 'watchlist',
        status: 'fail',
        detail: `${name}: ${count} physical copies (baseline ${base}) — new duplicate introduced; watchlist has zero tolerance`,
      });
    } else if (count > 1) {
      results.push({
        group: 'watchlist',
        status: 'warn',
        detail: `${name}: ${count} physical copies (ideal is 1, pre-existing) — drive it to 1 and re-baseline`,
      });
    } else if (count < base) {
      results.push({
        group: 'watchlist',
        status: 'warn',
        detail: `${name}: ${count} cop${count === 1 ? 'y' : 'ies'} (baseline ${base}) — improved; re-baseline to lock it in`,
      });
    } else {
      results.push({
        group: 'watchlist',
        status: 'ok',
        detail: `${name}: ${count} cop${count === 1 ? 'y' : 'ies'}`,
      });
    }
  }

  results.push({
    group: 'admin output',
    ...compareScalar(
      'public/admin total',
      baseline.adminOutput?.totalBytes,
      current.adminOutput.totalBytes,
      TOLERANCES.adminOutput
    ),
  });

  // Per-package unpacked size.
  const allPkgNames = new Set([
    ...Object.keys(baseline.packages || {}),
    ...Object.keys(current.packages || {}),
  ]);
  for (const name of [...allPkgNames].sort()) {
    const base = baseline.packages?.[name];
    const cur = current.packages?.[name];
    if (cur == null) {
      results.push({
        group: 'packages',
        status: 'warn',
        detail: `${name}: no longer packed (was ${fmtBytes(base)})`,
      });
      continue;
    }
    results.push({
      group: 'packages',
      ...compareScalar(name, base, cur, TOLERANCES.package),
    });
  }

  return results;
}

// ── main ──────────────────────────────────────────────────────────────────────
async function main() {
  const started = Date.now();
  if (REGISTRY_MODE !== 'verdaccio' && REGISTRY_MODE !== 'real') {
    fail(
      `--registry-mode must be "verdaccio" or "real" (got "${REGISTRY_MODE}")`
    );
  }
  log(`mode=${UPDATE ? 'update' : 'check'} registry-mode=${REGISTRY_MODE}`);
  const current = await measure();

  if (UPDATE) {
    writeBaseline(current);
    log(`done in ${((Date.now() - started) / 1000).toFixed(1)}s`);
    return;
  }

  const baseline = readBaseline();
  const results = compare(baseline, current);

  // Counted from results, never from the printed groups, so a metric group
  // missing from a display list can be badly rendered but never unenforced.
  const failed = results.filter((r) => r.status === 'fail').length;
  const warned = results.filter((r) => r.status === 'warn').length;

  const groups = [...new Set(results.map((r) => r.group))];
  for (const group of groups) {
    const rows = results.filter((r) => r.group === group);
    console.log(`\n── ${group} ──`);
    for (const r of rows) {
      const icon =
        r.status === 'fail' ? 'FAIL' : r.status === 'warn' ? 'WARN' : ' ok ';
      // Only print ok rows for scalar/watchlist groups to keep the log readable;
      // always print fails and warns.
      if (r.status !== 'ok' || group !== 'packages') {
        console.log(`  [${icon}] ${r.detail}`);
      }
    }
    if (group === 'packages') {
      const okCount = rows.filter((r) => r.status === 'ok').length;
      console.log(`  [ ok ] ${okCount} package(s) within tolerance`);
    }
  }

  console.log(
    `\n[size-baseline] ${failed} failing, ${warned} warning — ${((Date.now() - started) / 1000).toFixed(1)}s (registry-mode=${REGISTRY_MODE})`
  );

  writeStepSummary(results, groups, {
    failed,
    warned,
    seconds: ((Date.now() - started) / 1000).toFixed(1),
  });

  if (REGISTRY_MODE === 'real' && failed > 0) {
    console.log(
      '[size-baseline] NOTE: real-registry numbers can differ from the verdaccio baseline (published history); treat this as a canary to investigate.'
    );
  }

  if (failed > 0) process.exit(1);
}

// Only run when invoked as the entry script — the pure pieces (compareScalar,
// compare, unpackedSizeOfTarball) are imported by tests/size-baseline.test.ts.
const invokedDirectly =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
