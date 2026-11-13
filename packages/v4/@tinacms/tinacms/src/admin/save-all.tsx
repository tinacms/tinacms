import { Button } from '@tinacms/ui/components/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@tinacms/ui/components/popover';
import { Save } from 'lucide-react';
import { type ReactNode, use, useId, useState } from 'react';
import { ContentError } from '../core/content/contract';
import { resolveFormHooks } from '../core/form/hooks';
import { fieldsOf } from '../core/schema/children';
import type { CollectionSchema, FieldSchema } from '../core/schema/types';
import { useBranchView } from '../editor/branch';
import { TinaRuntimeContext } from '../editor/context';
import { useSaveDocument } from '../editor/content-queries';
import { readFormBindings } from '../editor/form-bindings';
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
  formEntries,
  isEdited,
  summarizeSaves,
  useAnyFormDirty,
  useAnySaveRunning,
  useFormStore,
  useSaveAllFailureCount,
  useSaveAllState,
} from '../form/form-store';
import { formatAdminRoute } from './routing';
import { saveFailureWords } from './save-failure';
import { dismissSaveFailedToast } from './document-form';
import { statusWords } from './status-words';

const RUN_STOPPED = 'the run stopped';

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
  stage: SaveStage,
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
    if (cause.code === 'not-found') {
      return {
        result: { status: 'failed', words: cause.message },
        stop,
      };
    }
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

function useSaveAllRun(): () => Promise<string> {
  const runtime = use(TinaRuntimeContext);
  const { save } = useSaveDocument();
  const branch = useBranchView();
  return async () => {
    if (!runtime) return '';
    const startStore = useFormStore.getState();
    const snapshot = formEntries(startStore.forms)
      .filter(([, form]) => formStatus(form) === 'dirty')
      .map(([formId]) => formId);
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
        let stage: SaveStage = 'validate';
        let outcome: { result: SaveAllResult; stop: boolean };
        try {
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
          dismissSaveFailedToast(formId);
          continue;
        } catch (cause) {
          outcome = failureOf(cause, stage, formId, collection);
          if (outcome.result.status === 'saved-with-warning') {
            dismissSaveFailedToast(formId);
          }
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

function SaveResults() {
  const [open, setOpen] = useState(false);
  const { results } = useSaveAllState();
  const collections = useFormStore((state) => state.collections);
  const entries = formEntries(results);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant='icon'
            size='sm'
            icon='doc'
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
                    onClick={() => setOpen(false)}
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
      {Object.keys(results).length > 0 ? <SaveResults /> : null}
      <span role='status' aria-live='polite' className='sr-only'>
        {announcement}
      </span>
    </div>
  );
}
