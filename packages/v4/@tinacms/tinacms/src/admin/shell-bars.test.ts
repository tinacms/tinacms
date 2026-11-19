import { describe, expect, it } from 'vitest';
import { statusWords } from './status-words';

describe('statusWords', () => {
  it('says no saves yet for idle local files, and no changes elsewhere', () => {
    expect(statusWords({ state: 'idle' }, true)).toBe(
      'No saves yet this session'
    );
    expect(statusWords({ state: 'idle' }, false)).toBe('No changes');
  });

  it.each([
    ['conflict', 'Save failed: someone else saved first'],
    ['branch-gone', 'Save failed: branch no longer exists'],
  ] as const)('words the %s failure', (reason, words) => {
    expect(statusWords({ state: 'failed', reason }, false)).toBe(words);
  });

  it('falls back to Save failed when the reason is unknown', () => {
    expect(statusWords({ state: 'failed', message: 'boom' }, false)).toBe(
      'Save failed'
    );
  });

  it('names the document a save wrote', () => {
    expect(statusWords({ state: 'saved', document: 'about.mdx' }, false)).toBe(
      'Saved: “about.mdx”'
    );
    expect(statusWords({ state: 'saved' }, false)).toBe('Saved');
  });

  it('words a Save All run', () => {
    expect(
      statusWords({ state: 'saving', runIndex: 2, runTotal: 5 }, false)
    ).toBe('Saving 2 of 5…');
    expect(
      statusWords({ state: 'failed', runFailed: 1, runTried: 2 }, false)
    ).toBe('Save failed: 1 of 2 documents');
    expect(statusWords({ state: 'saved', runSaved: 2 }, false)).toBe(
      'Saved 2 documents'
    );
    expect(
      statusWords({ state: 'saved', runSaved: 2, runWarnings: true }, false)
    ).toBe('Saved 2 documents with warnings');
  });
});
