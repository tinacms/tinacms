import { describe, expect, it } from 'vitest';
import type { SaveSummary } from '../form/form-store';
import { shortStatusWords, statusWords } from './status-words';

type Row = {
  summary: SaveSummary;
  local?: boolean;
  long: string;
  short: string;
};

const rows: Row[] = [
  { summary: { state: 'idle' }, long: 'No changes', short: 'No changes' },
  {
    summary: { state: 'idle' },
    local: true,
    long: 'No saves yet this session',
    short: 'No saves yet',
  },
  {
    summary: { state: 'idle', kept: true },
    long: 'Unsaved edits kept in this browser',
    short: 'Kept in this browser',
  },
  {
    summary: { state: 'idle', runSaved: 1 },
    long: 'Saved 1 document',
    short: 'Saved 1',
  },
  {
    summary: { state: 'idle', runSaved: 3, runWarnings: true },
    long: 'Saved 3 documents with warnings',
    short: 'Saved, with warnings',
  },
  {
    summary: { state: 'unsaved' },
    long: 'Unsaved changes',
    short: 'Unsaved',
  },
  { summary: { state: 'saving' }, long: 'Saving…', short: 'Saving…' },
  {
    summary: { state: 'saving', runIndex: 2, runTotal: 5 },
    long: 'Saving 2 of 5…',
    short: 'Saving 2 of 5…',
  },
  { summary: { state: 'saved' }, long: 'Saved', short: 'Saved' },
  {
    summary: { state: 'saved', document: 'hello.mdx' },
    long: 'Saved: “hello.mdx”',
    short: 'Saved',
  },
  {
    summary: { state: 'saved', runSaved: 4 },
    long: 'Saved 4 documents',
    short: 'Saved 4',
  },
  {
    summary: { state: 'saved', runSaved: 2, runWarnings: true },
    long: 'Saved 2 documents with warnings',
    short: 'Saved, with warnings',
  },
  { summary: { state: 'failed' }, long: 'Save failed', short: 'Save failed' },
  {
    summary: { state: 'failed', reason: 'conflict' },
    long: 'Save failed: someone else saved first',
    short: 'Save failed',
  },
  {
    summary: { state: 'failed', reason: 'branch-gone' },
    long: 'Save failed: branch no longer exists',
    short: 'Save failed',
  },
  {
    summary: { state: 'failed', runFailed: 2, runTried: 5 },
    long: 'Save failed: 2 of 5 documents',
    short: '2 of 5 failed',
  },
];

describe('status words', () => {
  it.each(rows)('$summary gives the long and short words', (row) => {
    const local = row.local ?? false;
    expect(statusWords(row.summary, local)).toBe(row.long);
    expect(shortStatusWords(row.summary, local)).toBe(row.short);
  });
});
