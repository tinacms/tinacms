import { createContext } from 'react';
import type { FormId } from '../form/form-store';

export interface SaveToNewBranchRequest {
  name: string;
  reason: 'protected' | 'deleted';
  formId: FormId;
}

/**
 * The one handler behind the Save to new branch dialog, given the confirmed name.
 * Provided inside `TinaAdmin` by the work that makes the branch. Without it the
 * dialog checks the name and its main action stays off. Not exported from any entry.
 */
export const SaveToNewBranchContext = createContext<
  ((request: SaveToNewBranchRequest) => Promise<void>) | undefined
>(undefined);
