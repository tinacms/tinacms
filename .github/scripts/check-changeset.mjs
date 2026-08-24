// Flags a PR that changes a published package's dependencies with no changeset: it would
// merge with no version bump and no release, so the change never reaches npm. Fails open.
import { execSync } from 'node:child_process';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const base = process.argv[2] ?? 'origin/main';

const git = (cmd) => execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });

const skip = (why) => {
  console.log(`Changeset check skipped: ${why}`);
  process.exit(0);
};

let changed;
try {
  changed = git(`git diff --name-only ${base}...HEAD`).split('\n').filter(Boolean);
} catch {
  skip(`cannot diff against "${base}". A shallow clone needs fetch-depth: 0.`);
}

if (changed.some((f) => /^\.changeset\/.+\.md$/.test(f))) {
  console.log('A changeset is present. Nothing to check.');
  process.exit(0);
}

let ignore = [];
try {
  ignore = JSON.parse(readFileSync('.changeset/config.json', 'utf8')).ignore ?? [];
} catch {
  skip('.changeset/config.json is missing or unreadable.');
}
const ignored = (name) =>
  ignore.some((p) => (p.endsWith('/*') ? name.startsWith(p.slice(0, -1)) : p === name));

// Walked rather than a fixed directory list, so a new nesting level cannot drop out silently.
const published = new Map();
const walk = (dir, depth = 0) => {
  if (depth > 4 || !existsSync(dir)) return;
  const manifest = join(dir, 'package.json');
  if (existsSync(manifest)) {
    try {
      const pkg = JSON.parse(readFileSync(manifest, 'utf8'));
      if (!pkg.private && pkg.name && !ignored(pkg.name)) {
        published.set(pkg.name, { manifest, pkg });
      }
      return; // a package root is a leaf; do not descend into its own subpackages
    } catch {
      /* unparseable manifest: ignore rather than fail the PR */
    }
  }
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry.startsWith('.')) continue;
    const next = join(dir, entry);
    if (statSync(next).isDirectory()) walk(next, depth + 1);
  }
};
walk('packages');

const affected = new Set();

for (const [name, { manifest }] of published) {
  if (changed.includes(manifest)) affected.add(name);
}

if (changed.includes('pnpm-workspace.yaml')) {
  const catalogKeys = (text) => {
    const out = new Map();
    let inCatalog = false;
    for (const line of text.split('\n')) {
      if (/^catalog:\s*$/.test(line)) { inCatalog = true; continue; }
      if (inCatalog && /^\S/.test(line)) break;
      const m = inCatalog && line.match(/^\s+(\S+):\s*(.+?)\s*$/);
      if (m) out.set(m[1].replace(/^['"]|['"]$/g, ''), m[2]);
    }
    return out;
  };

  let before;
  try {
    before = catalogKeys(git(`git show ${base}:pnpm-workspace.yaml`));
  } catch {
    before = new Map(); // absent at base: treat every current entry as new
  }
  const after = catalogKeys(readFileSync('pnpm-workspace.yaml', 'utf8'));
  const moved = [...after].filter(([k, v]) => before.get(k) !== v).map(([k]) => k);

  for (const [name, { pkg }] of published) {
    const deps = { ...pkg.dependencies, ...pkg.devDependencies, ...pkg.peerDependencies };
    if (moved.some((dep) => deps[dep]?.startsWith('catalog:'))) affected.add(name);
  }
}

if (affected.size === 0) {
  console.log('No published package is affected. No changeset required.');
  process.exit(0);
}

console.error(
  `No changeset found, but this PR changes dependencies of published packages:\n` +
    [...affected].sort().map((n) => `  - ${n}`).join('\n') +
    `\n\nWithout a changeset these packages get no version bump and no release, so the\n` +
    `change never reaches npm users. Run "pnpm changeset" and commit the result.\n` +
    `If the change genuinely needs no release, add an empty changeset ("pnpm changeset --empty").`,
);
process.exit(1);
