import type { SaveFailureReason, SaveSummary } from '../form/form-store';

const FAILURE_WORDS: Record<SaveFailureReason, string> = {
  conflict: 'Save failed: someone else saved first',
  'branch-gone': 'Save failed: branch no longer exists',
};

const savedWords = (saved: number, warnings: boolean | undefined) =>
  `Saved ${saved} ${saved === 1 ? 'document' : 'documents'}${warnings ? ' with warnings' : ''}`;

/** The Status bar's words for a save summary. Local files say so when nothing has saved. */
export function statusWords(summary: SaveSummary, local: boolean): string {
  switch (summary.state) {
    case 'idle':
      if (summary.runSaved) {
        return savedWords(summary.runSaved, summary.runWarnings);
      }
      if (summary.kept) return 'Unsaved edits kept in this browser';
      return local ? 'No saves yet this session' : 'No changes';
    case 'unsaved':
      return 'Unsaved changes';
    case 'saving':
      if (summary.runIndex !== undefined) {
        return `Saving ${summary.runIndex} of ${summary.runTotal}…`;
      }
      return 'Saving…';
    case 'saved':
      if (summary.runSaved) {
        return savedWords(summary.runSaved, summary.runWarnings);
      }
      return summary.document ? `Saved: “${summary.document}”` : 'Saved';
    case 'failed':
      if (summary.runFailed !== undefined) {
        return `Save failed: ${summary.runFailed} of ${summary.runTried} documents`;
      }
      return summary.reason ? FAILURE_WORDS[summary.reason] : 'Save failed';
  }
}
