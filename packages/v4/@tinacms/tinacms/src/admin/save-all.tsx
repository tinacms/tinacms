import { Button } from '@tinacms/ui/components/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@tinacms/ui/components/popover';
import { Save } from 'lucide-react';
import { type ReactNode, use, useId, useState } from 'react';
import { ContentError } from '../core/content/contract';
import { fieldEqualityFor } from '../core/form/compare';
import { resolveFormHooks } from '../core/form/hooks';
import { ingestDocument } from '../core/form/ingest';
import { fieldsOf } from '../core/schema/children';
import type { CollectionSchema, FieldSchema } from '../core/schema/types';
import { useBranchView } from '../editor/branch';
import { TinaRuntimeContext } from '../editor/context';
import { useSaveDocument } from '../editor/content-queries';
import { readFormBindings } from '../editor/form-bindings';
import { useContentSlice } from '../editor/hooks';
import {
  AfterSaveHookError,
  FormValidationError,
  type SaveStage,
  saveDocument,
} from '../editor/save-pipeline';
import {
  type FormId,
  type SaveAllResult,
  formStatus,
  isEdited,
  summarizeSaves,
  toFormValues,
  useAnyFormDirty,
  useAnySaveRunning,
  useFormStore,
  useSaveAllFailureCount,
  useSaveAllState,
  valuesEqual,
} from '../form/form-store';
import { formatAdminRoute } from './routing';
import { saveFailureWords } from './save-failure';
import { statusWords } from './shell-bars';

const NO_LONGER_EXISTS = 'This document no longer exists';
const CHANGED_ON_BRANCH =
  'Changed on the branch since you edited it. Save it from its form to overwrite, or discard your edits.';
const RUN_STOPPED = 'Not saved: the run stopped';

// A cause that will hit every remaining document ends the run.
const STOPPING_CODES: readonly string[] = [
  'branch-not-found',
  'unauthorized',
  'forbidden',
  'network',
];

const documentName = (formId: FormId) => formId.split('/').at(-1) ?? formId;

// The label of the deepest field the address names. A list index has no label of its own.
const labelAt = (
  collection: CollectionSchema,
  address: string
): string | undefined => {
  let level: FieldSchema[] | undefined = collection.fields;
  let label: string | undefined;
  for (const segment of address.split('.')) {
    if (/^\d+$/.test(segment)) continue;
    const node = level?.find((field) => field.name === segment);
    if (!node) break;
    label = node.label ?? node.name;
    level = fieldsOf(node);
  }
  return label;
};

const firstInvalidField = (
  formId: FormId,
  collection: CollectionSchema
): string => {
  const form = useFormStore.getState().forms[formId];
  const [address, messages] =
    Object.entries(isEdited(form) ? form.errors : {})[0] ?? [];
  const message = messages?.[0];
  if (!address || !message) return 'Some fields are not valid';
  return `${labelAt(collection, address) ?? address}: ${message}`;
};

const failureOf = (
  cause: unknown,
  stage: SaveStage | 'read',
  formId: FormId,
  collection: CollectionSchema
): { result: SaveAllResult; stop: boolean } => {
  if (cause instanceof AfterSaveHookError) {
    console.error('[tinacms] afterSave failed:', cause.cause);
    return { result: { status: 'saved-with-warning' }, stop: false };
  }
  if (cause instanceof FormValidationError) {
    return {
      result: {
        status: 'failed',
        words: firstInvalidField(formId, collection),
      },
      stop: false,
    };
  }
  console.error('[tinacms] Save failed:', cause);
  if (stage === 'beforeSave') {
    return {
      result: { status: 'failed', words: 'A beforeSave hook failed' },
      stop: false,
    };
  }
  if (cause instanceof ContentError) {
    const stop = STOPPING_CODES.includes(cause.code);
    if (cause.code === 'branch-not-found') {
      return {
        result: { status: 'failed', words: 'The branch no longer exists' },
        stop,
      };
    }
    if (stop) {
      return {
        result: { status: 'failed', words: saveFailureWords(cause).title },
        stop,
      };
    }
  }
  return { result: { status: 'failed', words: 'Save failed' }, stop: false };
};

/** Saves every dirty document, one at a time. Each one passes or fails on its own. */
function useSaveAllRun(): () => Promise<string> {
  const runtime = use(TinaRuntimeContext);
  const content = useContentSlice();
  const { save } = useSaveDocument();
  const branch = useBranchView();
  return async () => {
    if (!runtime) return '';
    const startStore = useFormStore.getState();
    const snapshot = (Object.keys(startStore.forms) as FormId[]).filter(
      (formId) => formStatus(startStore.forms[formId]) === 'dirty'
    );
    const { userId, branch: startBranch } = startStore;
    startStore.startSaveAll(snapshot.length);
    const record = (formId: FormId, result: SaveAllResult) =>
      useFormStore.getState().recordSaveAllResult(formId, result);
    const context = () => useFormStore.getState();
    try {
      for (const [index, formId] of snapshot.entries()) {
        const state = context();
        if (state.userId !== userId || state.branch !== startBranch) break;
        state.setSaveAllIndex(index + 1);
        if (formStatus(state.forms[formId]) !== 'dirty') continue;
        const collection = runtime.schema.collections.find(
          ({ name }) => name === state.collections[formId]
        );
        if (!collection) {
          record(formId, { status: 'failed', words: 'Save failed' });
          continue;
        }
        const transform = { documentPath: formId, registry: runtime.registry };
        let stage: SaveStage | 'read' = 'read';
        let outcome: { result: SaveAllResult; stop: boolean };
        try {
          const entry = await content.get(collection.name, formId);
          const form = context().forms[formId];
          if (!isEdited(form)) continue;
          if (entry === null) {
            record(formId, { status: 'failed', words: NO_LONGER_EXISTS });
            continue;
          }
          const file = toFormValues(
            ingestDocument(entry.document, collection.fields, transform)
          );
          if (!valuesEqual(form.baseline, file, form.equal)) {
            record(formId, { status: 'failed', words: CHANGED_ON_BRANCH });
            continue;
          }
          await saveDocument(
            {
              formId,
              path: formId,
              collection,
              hooks: resolveFormHooks(runtime.hooks, collection.hooks ?? []),
              registry: runtime.registry,
              validators: runtime.validators,
            },
            () => readFormBindings(formId),
            {
              write: (value) =>
                save({ collection: collection.name, path: formId, value }),
              onStage: (next) => {
                stage = next;
              },
            }
          );
          record(formId, { status: 'saved' });
          continue;
        } catch (cause) {
          outcome = failureOf(cause, stage, formId, collection);
        }
        record(formId, outcome.result);
        if (!outcome.stop) continue;
        for (const rest of snapshot.slice(index + 1)) {
          if (formStatus(context().forms[rest]) === 'dirty') {
            record(rest, { status: 'not-saved', words: RUN_STOPPED });
          }
        }
        break;
      }
    } finally {
      useFormStore.getState().endSaveAll();
    }
    return statusWords(
      summarizeSaves(useFormStore.getState()),
      branch?.mode === 'local'
    );
  };
}

const STATUS_WORDS = {
  saved: 'Saved',
  'saved-with-warning': 'Saved with warning',
  failed: 'Failed',
  'not-saved': 'Not saved',
} as const;

function SaveResults({ failed }: { failed: number }) {
  const { results } = useSaveAllState();
  const collections = useFormStore((state) => state.collections);
  const entries = Object.entries(results) as [FormId, SaveAllResult][];
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant='icon'
            size='sm'
            icon={failed > 0 ? 'error' : 'doc'}
            aria-label='Save results'
          />
        }
      />
      <PopoverContent
        aria-label='Save results'
        align='end'
        className='w-80 max-w-[calc(100vw-1rem)]'
      >
        <ul className='m-0 flex list-none flex-col gap-2 p-0'>
          {entries.map(([formId, result]) => {
            const words =
              result.status === 'failed' || result.status === 'not-saved'
                ? result.words
                : result.status === 'saved-with-warning'
                  ? 'Saved, but an afterSave hook failed'
                  : undefined;
            const collection = collections[formId];
            return (
              <li key={formId} className='flex flex-col gap-0.5'>
                <span className='min-w-0 truncate font-medium' title={formId}>
                  {documentName(formId)}
                </span>
                <span>
                  <strong className='font-semibold'>
                    {STATUS_WORDS[result.status]}
                  </strong>
                  {words ? `: ${words}` : null}
                </span>
                {result.status !== 'saved' && collection ? (
                  <a
                    className='text-primary underline'
                    href={formatAdminRoute({
                      view: 'document',
                      collection,
                      path: formId,
                    })}
                    aria-label={`Open ${documentName(formId)}`}
                  >
                    Open
                  </a>
                ) : null}
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

/** Why Save All is off, when the editor can act on it. Disabled with no words means a save runs or nothing is dirty. */
const useBlockedMessage = (): string | undefined => {
  const view = useBranchView();
  if (view?.mode !== 'branches') return undefined;
  if (view.listState === 'loading') return 'Checking the branch…';
  if (view.listState === 'failed') return 'Could not check the branch';
  const isProtected = view.branches.some(
    (entry) => entry.name === view.name && entry.protected
  );
  return isProtected
    ? 'Save each document to a new branch from its form'
    : undefined;
};

/** The Save All button, its result list and the live region that announces a finished run. */
export function SaveAllControl() {
  const run = useSaveAllRun();
  const running = useAnySaveRunning();
  const dirty = useAnyFormDirty();
  const message = useBlockedMessage();
  const { results } = useSaveAllState();
  const failed = useSaveAllFailureCount();
  const messageId = useId();
  const [announcement, setAnnouncement] = useState('');
  const disabled = running || message !== undefined || !dirty;
  const label = failed > 0 ? `Save all, ${failed} failed` : 'Save all';
  const button: ReactNode = (
    <Button
      variant='primary'
      size='sm'
      icon={failed > 0 ? 'error' : Save}
      disabled={disabled}
      aria-label={label}
      className='max-[479px]:w-8 max-[479px]:px-0'
      onClick={() => {
        setAnnouncement('');
        void run().then(setAnnouncement);
      }}
    >
      <span className='max-[479px]:hidden'>Save all</span>
      {failed > 0 ? (
        <span className='max-[479px]:hidden'>{failed} failed</span>
      ) : null}
    </Button>
  );
  return (
    <div className='flex items-center gap-1'>
      {message !== undefined && !running ? (
        <span
          tabIndex={0}
          role='group'
          aria-label='Save all, unavailable'
          aria-describedby={messageId}
          title={message}
          className='rounded-sm outline-none focus-visible:shadow-focus-ring'
        >
          {button}
          <span id={messageId} className='sr-only'>
            {message}
          </span>
        </span>
      ) : (
        button
      )}
      {Object.keys(results).length > 0 ? <SaveResults failed={failed} /> : null}
      <span role='status' aria-live='polite' className='sr-only'>
        {announcement}
      </span>
    </div>
  );
}
