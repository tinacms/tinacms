// Finds open Dependabot PRs whose only CI failure is pnpm's minimumReleaseAge check and
// reports the workflow runs that are safe to re-run: every flagged release has aged out.
// See https://github.com/tinacms/tinacms/issues/7949.
import { appendFileSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const VIOLATION = 'ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION';
const GRACE_MS = 5 * 60 * 1000;
const FAILED_CONCLUSIONS = new Set(['failure', 'timed_out']);

export const readMinimumReleaseAgeMinutes = (workspaceYaml) => {
  const match = workspaceYaml.match(/^minimumReleaseAge:\s*(\d+)/m);
  if (!match)
    throw new Error('minimumReleaseAge not found in pnpm-workspace.yaml');
  return Number(match[1]);
};

// Latest time a release flagged in this job log could have been published, or null when
// the job did not fail on the release-age check.
// NOTE: [29 Oct 2026] EK - pnpm lists only the first 20 flagged entries and then "...and N more",
// so a truncated list cannot show the newest release. The failure time is the safe bound,
// because nothing published after the install ran can have been flagged.
// See https://github.com/tinacms/tinacms/issues/7949.
export const newestFlaggedPublishTime = (log) => {
  const violationLine = log
    .split('\n')
    .find((line) => line.includes(`[${VIOLATION}]`));
  if (!violationLine) return null;

  if (/…and \d+ more|\.\.\.and \d+ more/.test(log)) {
    const failedAt = Date.parse(violationLine.split(' ')[0]);
    return Number.isNaN(failedAt) ? null : failedAt;
  }

  const published = [...log.matchAll(/was published at (\S+Z),/g)].map((m) =>
    Date.parse(m[1])
  );
  return published.length > 0 && !published.some(Number.isNaN)
    ? Math.max(...published)
    : null;
};

// Epoch ms from which a re-run clears the gate, or null when any failed job failed for
// another reason (or no log could be read), so the PR must be left alone.
export const readyAt = (failedJobLogs, minimumReleaseAgeMinutes) => {
  if (failedJobLogs.length === 0) return null;
  const times = failedJobLogs.map(newestFlaggedPublishTime);
  if (times.some((t) => t === null)) return null;
  return Math.max(...times) + minimumReleaseAgeMinutes * 60 * 1000 + GRACE_MS;
};

const repo = process.env.GITHUB_REPOSITORY;

const api = async (route, { method = 'GET', text = false } = {}) => {
  const res = await fetch(`https://api.github.com/repos/${repo}/${route}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.GH_TOKEN}`,
      Accept: 'application/vnd.github+json',
    },
  });
  if (!res.ok) throw new Error(`${method} ${route} failed: ${res.status}`);
  return text ? res.text() : res.json();
};

const openDependabotPulls = async () => {
  const pulls = [];
  for (let page = 1; page <= 5; page++) {
    const batch = await api(`pulls?state=open&per_page=100&page=${page}`);
    pulls.push(...batch);
    if (batch.length < 100) break;
  }
  return pulls.filter((pr) => pr.user.login === 'dependabot[bot]');
};

const failedJobLogs = async (runId) => {
  const { jobs } = await api(
    `actions/runs/${runId}/jobs?filter=latest&per_page=100`
  );
  const failed = jobs.filter((job) => FAILED_CONCLUSIONS.has(job.conclusion));
  return Promise.all(
    failed.map((job) => api(`actions/jobs/${job.id}/logs`, { text: true }))
  );
};

const setOutput = (name, value) => {
  if (process.env.GITHUB_OUTPUT)
    appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${value}\n`);
};

async function main() {
  const workspaceYaml = readFileSync('pnpm-workspace.yaml', 'utf8');
  const minutes = readMinimumReleaseAgeMinutes(workspaceYaml);
  const now = Date.now();
  const toRerun = [];

  for (const pr of await openDependabotPulls()) {
    const label = `https://github.com/${repo}/pull/${pr.number}`;
    const { workflow_runs: runs } = await api(
      `actions/runs?head_sha=${pr.head.sha}&per_page=100`
    );

    if (runs.some((run) => run.status !== 'completed')) {
      console.log(`${label}: CI still running, skipping`);
      continue;
    }
    const failed = runs.filter((run) => FAILED_CONCLUSIONS.has(run.conclusion));
    if (failed.length === 0) continue;

    if (failed.some((run) => run.run_attempt > 1)) {
      console.log(`${label}: already re-run once, leaving it alone`);
      continue;
    }

    const logs = (
      await Promise.all(failed.map((run) => failedJobLogs(run.id)))
    ).flat();
    const readyTime = readyAt(logs, minutes);
    if (readyTime === null) {
      console.log(`${label}: failing for another reason, leaving it alone`);
    } else if (now < readyTime) {
      console.log(
        `${label}: waiting until ${new Date(readyTime).toISOString()}`
      );
    } else {
      console.log(
        `${label}: every flagged release has aged out, re-running ${failed.length} run(s)`
      );
      toRerun.push(...failed.map((run) => run.id));
    }
  }

  setOutput('runs', JSON.stringify(toRerun));
}

// Only run as the entry script; the pure pieces are imported by tests/rerun-release-age-failures.test.ts.
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
