import { appendFileSync } from 'node:fs';

export const env = (name: string) => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
};

const ghToken = env('GH_TOKEN');
const typesafeKey = env('TYPESAFE_API_KEY');

export type Issue = {
  number: number;
  title: string;
  body: string | null;
  user: { login: string; type: string };
  labels: { name: string }[];
  pull_request?: unknown;
};

export const github = async <T,>(
  path: string,
  init?: { method: 'POST' | 'DELETE'; body?: unknown }
): Promise<T> => {
  const method = init?.method ?? 'GET';
  const res = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${ghToken}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: init?.body ? JSON.stringify(init.body) : undefined,
  });
  if (!res.ok)
    throw new Error(
      `GitHub ${method} ${path}: ${res.status} ${await res.text()}`
    );
  return res.json() as Promise<T>;
};

type Instructions = string | Record<string, unknown>;
export type NoulQuestion = { type: 'noul'; instructions: Instructions };
export type ChoiceQuestion = {
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

export const noul = (instructions: Instructions): NoulQuestion => ({
  type: 'noul',
  instructions,
});
export const choice = (
  instructions: Instructions,
  criteria: Record<string, string | null>
): ChoiceQuestion => ({
  type: 'choice',
  instructions,
  criteria,
});

export const systemOne = async <Q extends Record<string, Question>>(
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

export const summary = (lines: string[]) => {
  const out = `${lines.join('\n')}\n`;
  console.log(out);
  if (process.env.GITHUB_STEP_SUMMARY)
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, out);
};
