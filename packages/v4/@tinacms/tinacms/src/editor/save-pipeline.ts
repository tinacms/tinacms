import type { FieldAddress } from '../core/field/address';
import { toFieldAddress } from '../core/field/address';
import type { ValidatorRegistry } from '../core/field/contract';
import type { FieldRegistry } from '../core/field/registry';
import { runAfterSave, runBeforeSave } from '../core/form/hooks';
import type { FormHooks } from '../core/form/hooks';
import { digestDocument, ingestDocument } from '../core/form/ingest';
import { ContentError } from '../core/content/contract';
import type { CollectionSchema } from '../core/schema/types';
import {
  type FieldErrors,
  type FormId,
  type FormValues,
  toDocument,
  toFormValues,
  useFormStore,
} from '../form/form-store';
import type { SaveHandler } from './context';
import { type FormBindings } from './form-bindings';
import { validateDocument } from './resolver';

// Save refused because the document has validation errors. The form stays
// dirty and every field keeps its messages (ADR-018 §2).
export class FormValidationError extends Error {
  constructor() {
    super('The document has validation errors. Fix them, then save again.');
    this.name = 'FormValidationError';
  }
}

export class AfterSaveHookError extends Error {
  constructor(cause: unknown) {
    super('The document was saved, but an afterSave hook failed.', { cause });
    this.name = 'AfterSaveHookError';
  }
}

// The stored document becomes the baseline. A field the save changed takes the
// stored value, unless the editor changed it again while the save ran. Returns
// the fields it wrote, or null when the save changed nothing.
const adoptSavedValues = (
  formId: FormId,
  submitted: FormValues,
  saved: FormValues,
  setValue: (address: FieldAddress, value: unknown) => void
): FieldAddress[] | null => {
  const store = useFormStore.getState();
  const open = store.forms[formId];
  if (!open) return null;
  const changed = Object.keys(saved)
    .map(toFieldAddress)
    .filter(
      (address) => !open.equal(address, submitted[address], saved[address])
    );
  if (changed.length === 0) return null;
  const written = changed.filter((address) =>
    open.equal(address, open.values[address], submitted[address])
  );
  for (const address of written) {
    store.setFieldValue(formId, address, saved[address]);
    setValue(address, saved[address]);
  }
  store.markSaved(formId, saved);
  return written;
};

async function recordSavePhase(
  formId: FormId,
  run: () => Promise<void>
): Promise<void> {
  const { setSavePhase, restoreSavePhase, saves } = useFormStore.getState();
  const previous = saves[formId];
  setSavePhase(formId, { phase: 'saving' });
  try {
    await run();
  } catch (cause) {
    if (cause instanceof FormValidationError) {
      restoreSavePhase(formId, previous);
      throw cause;
    }
    let message = 'Save failed.';
    if (cause instanceof Error && cause.message) message = cause.message;
    if (cause instanceof ContentError && cause.code === 'branch-not-found') {
      setSavePhase(formId, { phase: 'failed', message, reason: 'branch-gone' });
    } else {
      setSavePhase(formId, { phase: 'failed', message });
    }
    throw cause;
  }
  setSavePhase(formId, { phase: 'saved' });
}

export type SaveStage = 'validate' | 'beforeSave' | 'write' | 'afterSave';

export interface SaveTarget {
  formId: FormId;
  path: string;
  collection: CollectionSchema;
  hooks: readonly FormHooks[];
  registry: FieldRegistry;
  validators: ValidatorRegistry;
}

export interface SaveSteps {
  /** Writes the document after `beforeSave`. */
  write?: SaveHandler | null;
  /** Runs once the write resolves and the form is marked saved, before `afterSave`. */
  afterWrite?: () => void;
  /** Reports the step the save has reached, so a caller can say which one failed. */
  onStage?: (stage: SaveStage) => void;
}

const mirrorErrors = (flat: Record<string, string[]>): FieldErrors => {
  const errors: FieldErrors = {};
  for (const [address, messages] of Object.entries(flat)) {
    errors[toFieldAddress(address)] = messages;
  }
  return errors;
};

// Without a mounted form, the store holds the values and the errors. The form
// that opens later reveals them once (`revealOnOpen`).
const validateWithoutForm = (target: SaveTarget): void => {
  const store = useFormStore.getState();
  const open = store.forms[target.formId];
  if (!open) throw new Error('The document is no longer open.');
  const flat = validateDocument(
    target.collection,
    target.registry,
    target.validators,
    toDocument(open.values)
  );
  store.setFieldErrors(target.formId, mirrorErrors(flat));
  if (Object.keys(flat).length === 0) return;
  store.setRevealOnOpen(target.formId);
  throw new FormValidationError();
};

/**
 * The one save flow: validate, digest, `beforeSave`, write, adopt the saved
 * values, `afterSave`. `bindings` is read at each step that needs the form,
 * because the form can mount or unmount while the write runs.
 */
export function saveDocument(
  target: SaveTarget,
  bindings: () => FormBindings | undefined,
  { write, afterWrite, onStage }: SaveSteps = {}
): Promise<void> {
  const { formId, path, collection, hooks, registry } = target;
  const stage = (next: SaveStage) => onStage?.(next);
  return recordSavePhase(formId, async () => {
    stage('validate');
    const mounted = bindings();
    if (mounted) {
      if (!(await mounted.validate())) throw new FormValidationError();
    } else {
      validateWithoutForm(target);
    }
    const open = useFormStore.getState().forms[formId];
    const current = bindings();
    const values = current
      ? current.getValues()
      : toDocument(open?.values ?? {});
    const submitted = structuredClone(toFormValues(values));
    const context = { documentPath: path, registry };
    const hookScope = { formId, path, collection };
    stage('beforeSave');
    const digested = await runBeforeSave(
      hooks,
      digestDocument(values, collection.fields, context),
      hookScope
    );
    stage('write');
    const saved = await write?.(digested);
    const savedDocument = saved ? saved.document : digested;
    const written = adoptSavedValues(
      formId,
      submitted,
      toFormValues(ingestDocument(savedDocument, collection.fields, context)),
      (address, value) => bindings()?.setValue(address, value)
    );
    if (!written) useFormStore.getState().markSaved(formId, submitted);
    if (written && written.length > 0) bindings()?.reseedFields();
    useFormStore.getState().clearFailedResult(formId);
    afterWrite?.();
    stage('afterSave');
    try {
      await runAfterSave(hooks, savedDocument, hookScope);
    } catch (cause) {
      throw new AfterSaveHookError(cause);
    }
    bindings()?.resetReveal();
    const warnings = saved ? (saved.hookWarnings ?? []) : [];
    if (warnings.length > 0) {
      throw new AfterSaveHookError(new Error(warnings.join(' ')));
    }
  });
}
