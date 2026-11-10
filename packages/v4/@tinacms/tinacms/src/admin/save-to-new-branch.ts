import { createContext } from 'react';
import type { FormId } from '../form/form-store';

export type SaveToNewBranchRequest = {
  name: string;
  reason: 'protected' | 'deleted';
} & ({ kind: 'form'; formId: FormId } | { kind: 'media' });

/**
 * The one handler behind the Save to new branch dialog, given the confirmed name.
 * Provided inside `TinaAdmin` by the work that makes the branch. Without it the
 * dialog checks the name and its main action stays off. Not exported from any entry.
 *
 * One owner per variant. For `form` the handler makes the branch and saves the form.
 * For `media` the handler only makes the branch and switches to it: the Media pane
 * then carries out the delete or move, so the request holds no media paths.
 */
export const SaveToNewBranchContext = createContext<
  ((request: SaveToNewBranchRequest) => Promise<void>) | undefined
>(undefined);
