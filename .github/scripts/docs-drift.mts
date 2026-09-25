// THROWAWAY dry-run prototype: audits tinacms/docs against this checkout; writes the job summary only.
import { execFileSync } from 'node:child_process';
import { appendFileSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, basename } from 'node:path';

const TINA = process.env.TINA_DIR!;
const DOCS = process.env.DOCS_DIR!;
const REF = 'HEAD';
const OUT = process.env.GITHUB_STEP_SUMMARY!;
const typesafeKey = process.env.TYPESAFE_API_KEY;
const LIMIT = Number(process.env.LIMIT ?? Infinity);
const STALE_THRESHOLD = 0.7;
const DOC_CHARS = 12000;
const SNIPPET_CHARS = 12000;
const CONCURRENCY = 5;

const git = (...args: string[]) =>
  execFileSync('git', ['-C', TINA, ...args], { maxBuffer: 1 << 30 }).toString();

const sourceFiles = new Map<string, string>();
const packageJsons = new Map<string, { name: string; text: string }>();
for (const path of git('ls-tree', '-r', '--name-only', REF, 'packages').split('\n')) {
  if (!path || path.startsWith('packages/v4/') || path.includes('node_modules')) continue;
  if (/\/package\.json$/.test(path) && path.split('/').length <= 4) {
    const text = git('show', `${REF}:${path}`);
    packageJsons.set(path, { name: JSON.parse(text).name, text });
  }
  if (!/\/src\/.*\.(ts|tsx|js|mjs)$/.test(path) || /\.(test|spec)\./.test(path) || path.includes('__tests__')) continue;
  sourceFiles.set(path, '');
}
const catFile = execFileSync('git', ['-C', TINA, 'cat-file', '--batch'], {
  input: [...sourceFiles.keys()].map((p) => `${REF}:${p}`).join('\n') + '\n',
  maxBuffer: 1 << 30,
});
{
  let offset = 0;
  for (const path of sourceFiles.keys()) {
    const headerEnd = catFile.indexOf(10, offset);
    const size = Number(catFile.subarray(offset, headerEnd).toString().split(' ')[2]);
    sourceFiles.set(path, catFile.subarray(headerEnd + 1, headerEnd + 1 + size).toString());
    offset = headerEnd + 1 + size + 1;
  }
}
const packageNames = new Set([...packageJsons.values()].map((p) => p.name));
const cliSource = [...sourceFiles].filter(([p]) => p.startsWith('packages/@tinacms/cli/src/')).map(([, t]) => t).join('\n');

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const hits = (identifier: string, files: Iterable<[string, string]> = sourceFiles) => {
  const re = new RegExp(`(?<![\\w$])${escape(identifier)}(?![\\w$])`);
  return [...files].filter(([, text]) => re.test(text)).map(([path]) => path);
};

type Missing = { identifier: string; kind: 'package' | 'subpath' | 'export' | 'command' | 'flag' };

const extract = (doc: string) => {
  const missing: Missing[] = [];
  const probes = new Set<string>();

  for (const m of doc.matchAll(/import\s+(?:type\s+)?(?:(\w+)\s*,?\s*)?(?:\{([^}]*)\})?\s*from\s*['"]((?:@tinacms\/[\w-]+|tinacms)(?:\/[\w/-]+)?)['"]/g)) {
    const [, , named, spec] = m;
    const pkg = spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : 'tinacms';
    const subpath = spec.slice(pkg.length + 1);
    if (!packageNames.has(pkg)) {
      missing.push({ identifier: spec, kind: 'package' });
      continue;
    }
    if (subpath) {
      const pkgJson = [...packageJsons.values()].find((p) => p.name === pkg)!.text;
      const base = basename(subpath);
      const hasSrc = [...sourceFiles.keys()].some((p) => new RegExp(`/src/${escape(base)}(/index)?\\.(ts|tsx)$`).test(p));
      if (!pkgJson.includes(subpath) && !hasSrc) missing.push({ identifier: spec, kind: 'subpath' });
    }
    for (const raw of named?.split(',') ?? []) {
      const name = raw.replace(/^\s*type\s+/, '').split(/\s+as\s+/)[0].trim();
      if (!name) continue;
      if (hits(name).length === 0) missing.push({ identifier: `${name} (from '${spec}')`, kind: 'export' });
      else probes.add(name);
    }
  }

  const code = [...doc.matchAll(/```[\s\S]*?```|`[^`\n]+`/g)].map((c) => c[0]).join('\n');
  for (const m of code.matchAll(/(?:^|[\s`"'])(?:npx |pnpm |yarn |pnpm dlx )?(?:tinacms|@tinacms\/cli(?:@\w+)?) ([a-z][\w:-]*)((?: +[^\s`'"&|;]+)*)/gm)) {
    const [, command, rest] = m;
    if (!new RegExp(`['"\`]${escape(command)}['"\`\\s]`).test(cliSource)) missing.push({ identifier: `tinacms ${command}`, kind: 'command' });
    for (const flag of rest.match(/--[a-zA-Z][\w-]*/g) ?? []) {
      if (!cliSource.includes(flag)) missing.push({ identifier: `tinacms ${command} ${flag}`, kind: 'flag' });
    }
  }

  for (const m of doc.matchAll(/`([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)`/g)) {
    const leaf = m[1].split('.').at(-1)!;
    if (leaf.length >= 5 && /[a-z][A-Z]/.test(leaf)) probes.add(leaf);
  }

  return { missing: [...new Map(missing.map((x) => [x.identifier, x])).values()], probes: [...probes] };
};

const snippetsFor = (probes: string[]) => {
  const out: { identifier: string; file: string; code: string }[] = [];
  let used = 0;
  for (const identifier of probes) {
    for (const file of hits(identifier).slice(0, 2)) {
      const lines = sourceFiles.get(file)!.split('\n');
      const i = lines.findIndex((l) => new RegExp(`(?<![\\w$])${escape(identifier)}(?![\\w$])`).test(l));
      const code = lines.slice(Math.max(0, i - 15), i + 25).join('\n');
      if (used + code.length > SNIPPET_CHARS) return out;
      used += code.length;
      out.push({ identifier, file, code });
    }
  }
  return out;
};

const CONTRADICTED =
  'Probability that the documentation page makes at least one concrete claim that the provided TinaCMS source code contradicts: ' +
  'an API, export, option, config key, CLI flag or default that was renamed, removed, or behaves differently than described. ' +
  'Code that is simply absent from the snippets is NOT a contradiction; only judge claims the snippets actually cover.';

const systemOne = async (state: unknown) => {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch('https://api.typesafe.ai/v1/systemone', {
      method: 'POST',
      headers: { Authorization: `Bearer ${typesafeKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'jev-latest', state, questions: { contradicted: { type: 'noul', instructions: CONTRADICTED } } }),
    });
    if (res.ok) {
      const { answers } = (await res.json()) as { answers: { contradicted: { noul: number } } };
      return answers.contradicted.noul;
    }
    if (!(res.status === 429 || res.status >= 500) || attempt === 3) throw new Error(`TypeSafe ${res.status}: ${await res.text()}`);
    await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
  }
};

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : /\.mdx?$/.test(name) ? [full] : [];
  });

type Result = { doc: string; missing: Missing[]; probes: number; p?: number; error?: string };
const docs = walk(DOCS).slice(0, LIMIT);
const results: Result[] = [];
let next = 0;
let done = 0;
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (next < docs.length) {
      const file = docs[next++];
      const text = readFileSync(file, 'utf8');
      const { missing, probes } = extract(text);
      const result: Result = { doc: relative(DOCS, file), missing, probes: probes.length };
      const snippets = snippetsFor(probes);
      if (typesafeKey && snippets.length) {
        try {
          result.p = await systemOne({ doc: { path: result.doc, content: text.slice(0, DOC_CHARS) }, source: snippets });
        } catch (err) {
          if (err instanceof Error) result.error = err.message;
          else result.error = String(err);
        }
      }
      results.push(result);
      if (++done % 25 === 0) console.error(`${done}/${docs.length}`);
    }
  })
);

const stale = results
  .filter((r) => r.missing.length || (r.p ?? 0) >= STALE_THRESHOLD)
  .sort((a, b) => (b.p ?? 0) + b.missing.length - ((a.p ?? 0) + a.missing.length));
const report = [
  `# Docs drift audit (dry run) — ${REF} @ ${git('rev-parse', '--short', REF).trim()}`,
  '',
  `Docs scanned: ${results.length} · Jev: ${typesafeKey ? 'on' : 'OFF (no TYPESAFE_API_KEY)'} · Flagged: ${stale.length} · Errors: ${results.filter((r) => r.error).length}`,
  '',
  ...stale.map((r) =>
    [
      `- [ ] \`${r.doc}\`${r.p !== undefined ? ` — P(contradicted) ${r.p.toFixed(2)}` : ''}`,
      ...r.missing.map((m) => `  - missing ${m.kind}: \`${m.identifier}\``),
    ].join('\n')
  ),
  '',
  '## Errors',
  ...results.filter((r) => r.error).map((r) => `- \`${r.doc}\`: ${r.error}`),
].join('\n');
appendFileSync(OUT, report);
console.log(report);
