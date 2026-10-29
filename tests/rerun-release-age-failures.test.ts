import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import {
  newestFlaggedPublishTime,
  readMinimumReleaseAgeMinutes,
  readyAt,
} from '../.github/scripts/rerun-release-age-failures.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const MINUTE = 60 * 1000;
const GRACE = 5 * MINUTE;

const entry = (name: string, publishedAt: string) =>
  `2026-10-29T01:29:53.4230143Z   ${name} was published at ${publishedAt}, within the minimumReleaseAge cutoff (2026-10-28T01:29:36.941Z)`;

const failureLog = (entries: string[], more = 0) =>
  [
    '2026-10-29T01:29:53.3852662Z ✗ Lockfile failed supply-chain policy check (2921 entries in 16.1s)',
    `2026-10-29T01:29:53.4229029Z [ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION] ${entries.length + more} lockfile entries failed verification:`,
    ...entries,
    ...(more > 0 ? [`2026-10-29T01:29:53.4268092Z   …and ${more} more`] : []),
    '2026-10-29T01:29:53.8353780Z ##[error]Process completed with exit code 1.',
  ].join('\n');

describe('readMinimumReleaseAgeMinutes', () => {
  it('reads the gate from the real workspace file', () => {
    const yaml = fs.readFileSync(
      path.join(__dirname, '..', 'pnpm-workspace.yaml'),
      'utf-8'
    );
    expect(readMinimumReleaseAgeMinutes(yaml)).toBeGreaterThan(0);
  });

  it('throws when the gate is missing', () => {
    expect(() => readMinimumReleaseAgeMinutes('packages: []\n')).toThrow();
  });
});

describe('newestFlaggedPublishTime', () => {
  it('returns the newest listed publish time when the list is complete', () => {
    const log = failureLog([
      entry('@aws-sdk/core@3.978.7', '2026-10-28T18:47:57.212Z'),
      entry('@rollup/rollup-darwin-arm64@4.66.0', '2026-10-28T13:28:22.000Z'),
    ]);
    expect(newestFlaggedPublishTime(log)).toBe(
      Date.parse('2026-10-28T18:47:57.212Z')
    );
  });

  it('falls back to the failure time when pnpm truncated the list', () => {
    const log = failureLog(
      [entry('@aws-sdk/core@3.978.7', '2026-10-28T18:47:57.212Z')],
      23
    );
    expect(newestFlaggedPublishTime(log)).toBe(
      Date.parse('2026-10-29T01:29:53.4229029Z')
    );
  });

  it('returns null for a job that failed for another reason', () => {
    expect(
      newestFlaggedPublishTime(
        '2026-10-29T01:00:00.0000000Z ##[error]tests failed'
      )
    ).toBeNull();
  });

  it('returns null when the violation lists no publish times', () => {
    const log =
      '2026-10-29T01:29:53.4229029Z [ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION] boom';
    expect(newestFlaggedPublishTime(log)).toBeNull();
  });
});

describe('readyAt', () => {
  const log = failureLog([entry('a@1.0.0', '2026-10-28T18:47:57.000Z')]);

  it('adds the release age and a grace period to the newest entry', () => {
    expect(readyAt([log], 1440)).toBe(
      Date.parse('2026-10-28T18:47:57.000Z') + 1440 * MINUTE + GRACE
    );
  });

  it('uses the newest entry across every failed job', () => {
    const newer = failureLog([entry('b@1.0.0', '2026-10-28T20:00:00.000Z')]);
    expect(readyAt([log, newer], 1440)).toBe(
      Date.parse('2026-10-28T20:00:00.000Z') + 1440 * MINUTE + GRACE
    );
  });

  it('refuses a PR when any failed job failed for another reason', () => {
    expect(readyAt([log, '##[error]tests failed'], 1440)).toBeNull();
  });

  it('refuses a PR with no readable failed jobs', () => {
    expect(readyAt([], 1440)).toBeNull();
  });
});
