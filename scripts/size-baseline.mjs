#!/usr/bin/env node
// @ts-check
/**
 * size-baseline.mjs — per-PR install/tarball/bundle budgets + duplicate-copy watchlist.
 *
 * Measures four metrics against a checked-in baseline (tests/size-baselines.json)
 * and fails when a change regresses them:
 *
 *   1. installClosureBytes — `du -sk node_modules` of a minimal npm-installed
 *      Astro fixture (tests/size-fixture). npm on purpose: npm's nested-duplicate
 *      behaviour is the failure mode we are guarding; pnpm's content-addressed
 *      store hides it.
 *   2. watchlist           — physical copy-count of each watchlist package
 *      (tinacms, mermaid, date-fns, typescript, react, graphql, lodash). The
 *      ideal is one physical copy each; the gate fails UNCONDITIONALLY (no
 *      tolerance band) the moment a package's copy-count rises ABOVE its
 *      baseline — i.e. a brand-new duplicate. Packages that already ship more
 *      than one copy (see the note in compare()) are baselined at their real
 *      count and surfaced as warnings, because hard-failing on a pre-existing,
 *      out-of-scope duplicate would leave CI permanently red. Copies are
 *      counted from the installed node_modules on disk (a package dir whose
 *      package.json `name` matches); the spec's suggested `npm ls --all --json`
 *      enumerates logical dependency EDGES, which massively overcounts hoisted
 *      singletons like react.
 *   3. packages            — `unpackedSize` of every publishable workspace package
 *      (discovered the same way tests/build-verification.test.ts does).
 *   4. adminOutput.totalBytes — total bytes of examples/next/kitchen-sink/public/admin
 *      after `tinacms build`. (Kept as an object so #7245/#7246 can later split it
 *      into shell-dist + project-chunk budgets without a shape change.)
 *
 * Tolerance (metrics 1, 3, 4): fail when current exceeds baseline by more than
 * 5% OR 5 MB, whichever is larger. A decrease of more than 10% warns, prompting
 * a re-baseline so wins get locked in. The watchlist has zero tolerance.
 *
 * Usage:
 *   node scripts/size-baseline.mjs                       # check against baseline (verdaccio)
 *   node scripts/size-baseline.mjs --update              # regenerate the baseline JSON
 *   node scripts/size-baseline.mjs --registry-mode=real  # cron: install from real npm
 *
 * Prerequisite: `pnpm build` must have run — metrics 3 and 4 read built dist output.
 *
 * ── Verdaccio limitation (documented on purpose, per #7238) ──────────────────
 * The default (verdaccio) mode packs the CURRENT workspace, publishes the
 * tarballs into a throwaway verdaccio registry, and installs the fixture against
 * it. That reproduces npm's *resolution* of the code in this PR, but it does NOT
 * reproduce registry HISTORY. The 1412→1037 MB incident was caused by a stale
 * version already published to npm (an exact-pinned `tinacms` nesting duplicate
 * copies); verdaccio, seeded only from HEAD, can never surface that class of bug.
 * The scheduled cron job runs `--registry-mode=real`, which skips verdaccio and
 * installs the fixture straight from registry.npmjs.org, so it DOES see published
 * history. Real-registry numbers legitimately differ from the verdaccio baseline
 * (npm may resolve newer transitive versions), so treat cron failures as a canary
 * to investigate, not necessarily a hard regression in the current diff.
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
const BASELINE_PATH = path.join(ROOT, 'tests', 'size-baselines.json');
const ADMIN_DIR = path.join(
  ROOT,
  'examples',
  'next',
  'kitchen-sink',
  'public',
  'admin'
);

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

const TOLERANCE_PCT = 0.05;
const TOLERANCE_ABS_BYTES = 5 * 1024 * 1024; // 5 MB
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
if (REGISTRY_MODE !== 'verdaccio' && REGISTRY_MODE !== 'real') {
  fail(
    `--registry-mode must be "verdaccio" or "real" (got "${REGISTRY_MODE}")`
  );
}

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
function unpackedSizeOfTarball(tgzPath) {
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
  // Local packages get NO `proxy` — verdaccio serves only what we publish, so
  // the fixture resolves the CURRENT workspace and not whatever is on npm.
  // Everything else (astro, react, …) proxies npmjs.
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
  '@tinacms/*':
    access: $all
    publish: $anonymous
    unpublish: $anonymous
  'tinacms':
    access: $all
    publish: $anonymous
    unpublish: $anonymous
  'tinacms-*':
    access: $all
    publish: $anonymous
    unpublish: $anonymous
  'create-tina-app':
    access: $all
    publish: $anonymous
    unpublish: $anonymous
  'next-tinacms-*':
    access: $all
    publish: $anonymous
    unpublish: $anonymous
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

// ── fixture install + measurement ─────────────────────────────────────────────
function cleanFixture() {
  for (const f of ['node_modules', 'package-lock.json']) {
    fs.rmSync(path.join(FIXTURE_DIR, f), { recursive: true, force: true });
  }
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
  // The spec's suggested mechanism is `npm ls --all --json`, but that tree
  // enumerates logical dependency EDGES: a single hoisted copy of react is
  // listed once under every one of its (many) dependents, so edge-counting
  // wildly overcounts. "Physical copy" means a real directory on disk, so we
  // walk the installed node_modules tree and count actual package directories.
  // We stay inside node_modules subtrees (never descending into package source)
  // so the walk is bounded and fast even on a ~1 GB install.
  const counts = {};
  for (const name of WATCHLIST) counts[name] = 0;
  const watch = new Set(WATCHLIST);

  // A physical copy is a package directory whose package.json `name` is a
  // watchlist entry. We read the name (not the directory basename) so scoped
  // packages that happen to end in a watchlist word — @types/react,
  // @monaco-editor/react, @graphql-typed-document-node/graphql — are never
  // mistaken for the bare package.
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

// `tinacms build --local` spins up the datalayer GraphQL server on port 9000
// and does not always release it promptly, so a fast re-run (e.g. size:update
// then size:check locally) can collide with a lingering server. A fresh CI
// runner never hits this, but freeing the port up-front makes local reruns
// reliable. Best-effort and posix-only (the job is ubuntu-only); we only ever
// target the datalayer's own default port.
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
    installFixture();
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
 * @returns {{status:'ok'|'fail'|'warn', detail:string}}
 */
function compareScalar(label, baseline, current) {
  if (baseline == null) {
    return { status: 'warn', detail: `${label}: no baseline (new metric)` };
  }
  const threshold =
    baseline + Math.max(baseline * TOLERANCE_PCT, TOLERANCE_ABS_BYTES);
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

function compare(baseline, current) {
  const results = [];

  results.push({
    group: 'install closure',
    ...compareScalar(
      'du -sk node_modules',
      baseline.installClosureBytes,
      current.installClosureBytes
    ),
  });

  // Watchlist — zero tolerance on ANY increase in physical copies.
  //
  // The ideal for every watchlist package is a single physical copy. Two of
  // them (typescript via @tinacms/mdx, lodash via @graphql-codegen/*) already
  // ship more than one copy in the current tree; fixing that is out of scope
  // for this measurement job (#7238), and hard-failing on the pre-existing
  // state would leave CI permanently red — the exact "rubber-stamp the
  // re-baseline" failure mode the spec tells us to design against. So the gate
  // is: fail unconditionally (no tolerance band) the moment a package's copy
  // count rises ABOVE its baseline — a brand-new duplicate, which is the
  // regression we care about. Pre-existing duplicates are surfaced as warnings
  // so they stay visible and can be driven back down to 1 and re-baselined.
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
      current.adminOutput.totalBytes
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
    results.push({ group: 'packages', ...compareScalar(name, base, cur) });
  }

  return results;
}

// ── main ──────────────────────────────────────────────────────────────────────
async function main() {
  const started = Date.now();
  log(`mode=${UPDATE ? 'update' : 'check'} registry-mode=${REGISTRY_MODE}`);
  const current = await measure();

  if (UPDATE) {
    writeBaseline(current);
    log(`done in ${((Date.now() - started) / 1000).toFixed(1)}s`);
    return;
  }

  const baseline = readBaseline();
  const results = compare(baseline, current);

  const groups = ['install closure', 'watchlist', 'admin output', 'packages'];
  let failed = 0;
  let warned = 0;
  for (const group of groups) {
    const rows = results.filter((r) => r.group === group);
    if (!rows.length) continue;
    console.log(`\n── ${group} ──`);
    for (const r of rows) {
      const icon =
        r.status === 'fail' ? 'FAIL' : r.status === 'warn' ? 'WARN' : ' ok ';
      if (r.status === 'fail') failed++;
      if (r.status === 'warn') warned++;
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

  if (REGISTRY_MODE === 'real' && failed > 0) {
    console.log(
      '[size-baseline] NOTE: real-registry numbers can differ from the verdaccio baseline (published history); treat this as a canary to investigate.'
    );
  }

  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
