// Classifies one newly opened issue with Jev (typesafe.ai) against the label taxonomy in
// AGENTS.md and applies the primary category, plus onboarding/🤖AI when clearly suitable.
import {
  type Issue,
  choice,
  env,
  github,
  noul,
  summary,
  systemOne,
} from './jev.mts';

const repo = env('GITHUB_REPOSITORY');
const targetNumber = Number(env('ISSUE_NUMBER'));
const dryRun = process.env.DRY_RUN === 'true';

const CATEGORY_THRESHOLD = 0.7;
const SCOPE_THRESHOLD = 0.85;
const BODY_CHARS = 4000;
const PENDING_TRIAGE = 'pending triage';
const PROGRAM_LABELS = ['v4.0', 'For 4.1'];

const CATEGORIES = {
  bug: 'Broken behavior, error, crash, wrong output',
  enhancement: 'Feature request, new capability',
  security: 'Vulnerabilities, code-scanning alerts',
  documentation: 'Docs, READMEs, guides',
  'technical-debt': 'Refactor, dead code, architectural cleanup',
  chore: 'Dep bumps, config, build, CI, scaffolding',
  tests: 'Adding or expanding test coverage',
  perf: 'Slow, scale, throughput, memory',
  dx: 'Developer-facing CLI / errors / logging',
  ux: 'Visual, UX, layout, copy, animation',
  'rich-text': 'Plate, MDX, markdown rendering, body field, embed templates',
  'form-system': 'Form fields, validation, dirty state, field plugins',
  media: 'Media library, upload, browse',
  'starter-template': 'create-tina-app, Astro/Next/Hugo starters',
  'self-hosted': 'Self-hosted setup, externalization, database, sqlite-level',
  'editorial-workflow': 'Branches, PRs, protected-branch flow',
} as const satisfies Record<string, string>;
type Category = keyof typeof CATEGORIES;

const isCategory = (label: string): label is Category => label in CATEGORIES;

const securityComment =
  `This issue may describe a security vulnerability. Per [SECURITY.md](https://github.com/${repo}/blob/main/SECURITY.md), ` +
  'please report vulnerabilities privately to security@tina.io or as a draft GitHub Security Advisory, ' +
  'and avoid posting further details here. A maintainer will review this issue.';

const target = await github<Issue>(`/repos/${repo}/issues/${targetNumber}`);
const labels = target.labels.map((l) => l.name);
const deliberate = labels.filter((l) => isCategory(l) && l !== 'bug');
if (deliberate.length > 0) {
  summary([
    `## Classify #${target.number}: ${target.title}`,
    '',
    `Skipped: already labelled ${deliberate.join(', ')}.`,
  ]);
  process.exit(0);
}

const answers = await systemOne(
  {
    issue: {
      title: target.title,
      body: (target.body ?? '').slice(0, BODY_CHARS),
    },
  },
  {
    category: choice(
      {
        question: 'Which label best categorises `issue`?',
        rubric:
          'Pick the most specific label that fits. Prefer an area label (rich-text, media, form-system, ' +
          'self-hosted, starter-template, editorial-workflow) over bug or enhancement when the issue is ' +
          'clearly about that area.',
      },
      CATEGORIES
    ),
    onboarding: noul({
      question:
        'Is `issue` a small, well-scoped task suitable for a developer new to the project?',
      rubric:
        'It needs a clear expected outcome and should touch one area of the code. ' +
        'Vague reports, design questions and cross-cutting changes do not qualify.',
    }),
    ai: noul({
      question:
        'Could an AI coding agent implement `issue` end to end from a single prompt?',
      rubric:
        'The desired change must be unambiguous from the issue alone and need no product decisions, ' +
        'manual reproduction in a browser, or access to external services.',
    }),
  }
);

const category = answers.category.choice;
if (!isCategory(category))
  throw new Error(`Jev chose "${category}", which is not a category`);
const confidence = answers.category.probabilities[category];
const confident = confidence >= CATEGORY_THRESHOLD;
const inProgram = labels.some((l) => PROGRAM_LABELS.includes(l));
const scopeEligible = confident && category !== 'security' && !inProgram;

const add: string[] = [];
const remove: string[] = [];
if (!confident) {
  if (!labels.includes(PENDING_TRIAGE)) add.push(PENDING_TRIAGE);
} else if (category === 'security') {
  if (!labels.includes(PENDING_TRIAGE)) add.push(PENDING_TRIAGE);
} else {
  if (!labels.includes(category)) add.push(category);
  if (category !== 'bug' && labels.includes('bug')) remove.push('bug');
  if (labels.includes(PENDING_TRIAGE)) remove.push(PENDING_TRIAGE);
}
if (scopeEligible && answers.onboarding.noul >= SCOPE_THRESHOLD)
  add.push('onboarding');
if (scopeEligible && answers.ai.noul >= SCOPE_THRESHOLD) add.push('🤖AI');

const top = Object.entries(answers.category.probabilities)
  .sort(([, a], [, b]) => b - a)
  .slice(0, 3);
summary([
  `## Classify #${target.number}: ${target.title}`,
  '',
  `Decision: add ${add.join(', ') || 'nothing'}; remove ${remove.join(', ') || 'nothing'}${dryRun ? ' (dry run)' : ''}.`,
  category === 'security' && confident
    ? 'Flagged as a possible security report: commenting instead of labelling.'
    : '',
  '',
  '| Question | Score |',
  '|---|---|',
  ...top.map(([label, p]) => `| category: ${label} | ${p.toFixed(2)} |`),
  `| onboarding | ${answers.onboarding.noul.toFixed(2)} |`,
  `| 🤖AI | ${answers.ai.noul.toFixed(2)} |`,
  inProgram ? `| (scope labels skipped: v4 program issue) | |` : '',
]);

if (dryRun) process.exit(0);

if (category === 'security' && confident)
  await github(`/repos/${repo}/issues/${target.number}/comments`, {
    method: 'POST',
    body: { body: securityComment },
  });
if (add.length > 0)
  await github(`/repos/${repo}/issues/${target.number}/labels`, {
    method: 'POST',
    body: { labels: add },
  });
for (const label of remove)
  await github(
    `/repos/${repo}/issues/${target.number}/labels/${encodeURIComponent(label)}`,
    { method: 'DELETE' }
  );
