// Checks one newly opened issue against every open issue with Jev (typesafe.ai) and, when
// confident, comments with the canonical issue and applies the "🤖 Duplicate" label.
import { appendFileSync } from 'node:fs';

const env = (name: string) => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
};

const repo = env('GITHUB_REPOSITORY');
const ghToken = env('GH_TOKEN');
const typesafeKey = env('TYPESAFE_API_KEY');
const targetNumber = Number(env('ISSUE_NUMBER'));
const dryRun = process.env.DRY_RUN === 'true';

const DUPLICATE_LABEL = '🤖 Duplicate';
const PAGE_SIZE = 100;
const SHORTLIST_PER_PAGE = 3;
const DUPLICATE_THRESHOLD = 0.85;
const RELATED_THRESHOLD = 0.6;
const EXCERPT_CHARS = 400;
const BODY_CHARS = 4000;

type Issue = {
  number: number;
  title: string;
  body: string | null;
  user: { login: string; type: string };
  pull_request?: unknown;
};

const github = async <T,>(path: string, post?: unknown): Promise<T> => {
  const res = await fetch(`https://api.github.com${path}`, {
    method: post ? 'POST' : 'GET',
    headers: {
      Authorization: `Bearer ${ghToken}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(post ? { 'Content-Type': 'application/json' } : {}),
    },
    body: post ? JSON.stringify(post) : undefined,
  });
  if (!res.ok)
    throw new Error(
      `GitHub ${post ? 'POST' : 'GET'} ${path}: ${res.status} ${await res.text()}`
    );
  return res.json() as Promise<T>;
};

const listOpenIssues = async () => {
  const issues: Issue[] = [];
  for (let page = 1; ; page++) {
    const batch = await github<Issue[]>(
      `/repos/${repo}/issues?state=open&per_page=100&page=${page}`
    );
    issues.push(...batch);
    if (batch.length < 100) return issues;
  }
};

type Instructions = string | Record<string, unknown>;
type NoulQuestion = { type: 'noul'; instructions: Instructions };
type ChoiceQuestion = {
  type: 'choice';
  instructions: Instructions;
  criteria: Record<string, string | null>;
};
type Question = NoulQuestion | ChoiceQuestion;
type Answer<Q extends Question> = Q extends ChoiceQuestion
  ? {
      type: 'choice';
      choice: string;
      probabilities: Record<string, number>;
      confidence: number;
    }
  : { type: 'noul'; noul: number };
type Answers<Q extends Record<string, Question>> = {
  [K in keyof Q]: Answer<Q[K]>;
};

const noul = (instructions: Instructions): NoulQuestion => ({
  type: 'noul',
  instructions,
});
const choice = (
  instructions: Instructions,
  criteria: Record<string, string | null>
): ChoiceQuestion => ({
  type: 'choice',
  instructions,
  criteria,
});

const systemOne = async <Q extends Record<string, Question>>(
  state: unknown,
  questions: Q
) => {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch('https://api.typesafe.ai/v1/systemone', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${typesafeKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model: 'jev-latest', state, questions }),
    });
    if (res.ok) {
      const { answers } = (await res.json()) as { answers: Answers<Q> };
      return answers;
    }
    const retryable = res.status === 429 || res.status >= 500;
    if (!retryable || attempt === 3)
      throw new Error(`TypeSafe ${res.status}: ${await res.text()}`);
    await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
  }
};

const SAME_PROBLEM =
  'Two issues report the same problem when they share a root cause or the same user-facing failure. ' +
  'The same error in a different framework counts. The same component with a different symptom does not. ' +
  'A shared broad topic (media, rich-text, auth) on its own does not.';

const rankPage = async (target: Issue, page: Issue[]) => {
  const candidates = page.map((c) => ({
    number: c.number,
    title: c.title,
    excerpt: (c.body ?? '').slice(0, EXCERPT_CHARS),
  }));
  const answers = await systemOne(
    {
      target: {
        number: target.number,
        title: target.title,
        body: target.body ?? '',
      },
      candidates,
    },
    {
      which: choice(
        {
          question:
            'Which issue in `candidates` reports the same problem as `target`?',
          rubric: SAME_PROBLEM,
        },
        Object.fromEntries(candidates.map((c) => [String(c.number), c.title]))
      ),
    }
  );
  return Object.entries(answers.which.probabilities)
    .sort(([, a], [, b]) => b - a)
    .slice(0, SHORTLIST_PER_PAGE)
    .map(([number]) => Number(number));
};

// Choice probabilities sum to 1 within a page, so page winners are only comparable after a
// second pass that puts them in one Choice and asks an absolute yes/no per candidate.
const rerank = async (target: Issue, shortlist: Issue[]) => {
  const candidates = shortlist.map((c) => ({
    number: c.number,
    title: c.title,
    body: (c.body ?? '').slice(0, BODY_CHARS),
  }));
  const same: Record<`same::${number}`, NoulQuestion> = Object.fromEntries(
    candidates.map((c) => [
      `same::${c.number}`,
      noul({
        question: `Does the issue numbered ${c.number} in \`candidates\` report the same problem as \`target\`?`,
        rubric: SAME_PROBLEM,
      }),
    ])
  );
  const questions: { which: ChoiceQuestion } & typeof same = {
    which: choice(
      {
        question: 'Which issue in `candidates` is the best match for `target`?',
        rubric: SAME_PROBLEM,
      },
      Object.fromEntries(candidates.map((c) => [String(c.number), c.title]))
    ),
    ...same,
  };
  const answers = await systemOne(
    {
      target: {
        number: target.number,
        title: target.title,
        body: (target.body ?? '').slice(0, BODY_CHARS),
      },
      candidates,
    },
    questions
  );
  const winner = Number(answers.which.choice);
  return {
    winner,
    probability: answers[`same::${winner}`].noul,
    all: candidates.map((c) => ({
      number: c.number,
      title: c.title,
      probability: answers[`same::${c.number}`].noul,
    })),
  };
};

const errorLine = (issue: Issue) => {
  const section = (issue.body ?? '')
    .split(/^### /m)
    .find((s) => s.startsWith('The exact error message'));
  if (!section) return null;
  const line = section
    .split('\n')
    .slice(1)
    .map((l) => l.trim())
    .find((l) => l && !l.startsWith('```') && l !== '_No response_');
  return line ?? null;
};

const duplicateComment = (target: Issue, winner: Issue) => {
  const line = errorLine(target);
  const shared =
    line && (winner.body ?? '').includes(line)
      ? ` Both report \`${line}\`.`
      : '';
  return (
    `This looks like a duplicate of #${winner.number} (${winner.title}).${shared}\n\n` +
    `If that is the same problem, please add anything new (your versions, framework, or a repro) to #${winner.number} so the discussion stays in one place. A maintainer will confirm and close this one.\n\n` +
    'If it is not the same problem, say so here and we will triage it separately.'
  );
};

const relatedComment = (winner: Issue) =>
  `This may be related to #${winner.number} (${winner.title}).\n\n` +
  'Worth a look before a maintainer triages this; if it is the same problem, please add your details there.';

const summary = (lines: string[]) => {
  const out = `${lines.join('\n')}\n`;
  console.log(out);
  if (process.env.GITHUB_STEP_SUMMARY)
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, out);
};

const target = await github<Issue>(`/repos/${repo}/issues/${targetNumber}`);
const open = (await listOpenIssues()).filter(
  (i) => !i.pull_request && i.number !== target.number && i.user.type !== 'Bot'
);
if (open.length === 0) {
  summary([`No open issues to compare #${target.number} against.`]);
  process.exit(0);
}

const pages = Array.from(
  { length: Math.ceil(open.length / PAGE_SIZE) },
  (_, i) => open.slice(i * PAGE_SIZE, (i + 1) * PAGE_SIZE)
);
const shortlisted = (
  await Promise.all(pages.map((page) => rankPage(target, page)))
).flat();
const byNumber = new Map(open.map((i) => [i.number, i]));
const shortlist = shortlisted
  .map((n) => byNumber.get(n))
  .filter((i) => i !== undefined);
const result = await rerank(target, shortlist);
const winner = byNumber.get(result.winner);
if (!winner)
  throw new Error(`Jev chose #${result.winner}, which is not in the shortlist`);

const alreadyLinked = (target.body ?? '').includes(`#${winner.number}`);
const tier =
  result.probability >= DUPLICATE_THRESHOLD && !alreadyLinked
    ? 'duplicate'
    : result.probability >= RELATED_THRESHOLD
      ? 'related'
      : 'none';

summary([
  `## Dedupe #${target.number}: ${target.title}`,
  '',
  `Compared against ${open.length} open issues in ${pages.length} page(s). Decision: **${tier}**${dryRun ? ' (dry run)' : ''}.`,
  alreadyLinked
    ? `Capped at related: the issue already mentions #${winner.number}.`
    : '',
  '',
  '| Candidate | P(same problem) |',
  '|---|---|',
  ...result.all
    .sort((a, b) => b.probability - a.probability)
    .map((c) => `| #${c.number} ${c.title} | ${c.probability.toFixed(2)} |`),
]);

if (tier === 'none' || dryRun) process.exit(0);

const body =
  tier === 'duplicate'
    ? duplicateComment(target, winner)
    : relatedComment(winner);
await github(`/repos/${repo}/issues/${target.number}/comments`, { body });
if (tier === 'duplicate') {
  await github(`/repos/${repo}/issues/${target.number}/labels`, {
    labels: [DUPLICATE_LABEL],
  });
}
