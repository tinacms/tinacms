import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@tinacms/ui/components/alert-dialog';
import { Button } from '@tinacms/ui/components/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@tinacms/ui/components/dialog';
import { Input } from '@tinacms/ui/components/input';
import { Label } from '@tinacms/ui/components/label';
import { toast } from '@tinacms/ui/components/toast';
import { type FormEvent, useEffect, useId, useRef, useState } from 'react';
import {
  ContentError,
  type DocumentReferrer,
} from '../../core/content/contract';
import { isValidName, nameOf } from '../../core/content/names';
import { UnsavedReferrersError } from '../../editor/collection-documents';
import { formatAdminRoute } from '../routing';

const GENERIC_FAILURE = 'Something went wrong. Please try again.';
const REFERRER_LIMIT = 10;

/** The sentence under a dialog's box. A `ContentError` already carries the right words. */
const messageOf = (cause: unknown): string => {
  if (cause instanceof Error) return cause.message || GENERIC_FAILURE;
  return GENERIC_FAILURE;
};

const plural = (count: number, one: string, many: string): string =>
  `${count} ${count === 1 ? one : many}`;

/** Where focus goes when a dialog closes. `false` leaves focus alone, for a caller that moves it later. */
export type FocusTarget = () => HTMLElement | null | false;

const EMPTY_NAME_MESSAGE = 'Enter a name.';

/** What the dialog shows under its box: a sentence, plus the documents that block it. */
interface Refusal {
  message: string;
  blockedBy: DocumentReferrer[];
}

const refusalOf = (cause: unknown): Refusal => {
  if (cause instanceof UnsavedReferrersError) {
    return {
      message: 'Save or discard your unsaved edits to these documents first:',
      blockedBy: cause.referrers,
    };
  }
  return { message: messageOf(cause), blockedBy: [] };
};

function DocumentList({
  referrers,
  onOpen,
}: {
  referrers: readonly DocumentReferrer[];
  onOpen?: () => void;
}) {
  const shown = referrers.slice(0, REFERRER_LIMIT);
  const rest = referrers.length - shown.length;
  return (
    <>
      <ul className='m-0 list-disc pl-5'>
        {shown.map((referrer) => {
          const name = referrer.title ? referrer.title : nameOf(referrer.path);
          return (
            <li key={`${referrer.collection}:${referrer.path}`}>
              {onOpen ? (
                <a
                  href={formatAdminRoute({
                    view: 'document',
                    collection: referrer.collection,
                    path: referrer.path,
                  })}
                  className='underline'
                  onClick={onOpen}
                >
                  {name}
                </a>
              ) : (
                name
              )}
            </li>
          );
        })}
      </ul>
      {rest > 0 ? <p className='m-0'>{`and ${rest} more`}</p> : null}
    </>
  );
}

interface NameDialogProps {
  open: boolean;
  title: string;
  description?: string;
  /** The box's name, such as "File name". */
  label: string;
  confirmLabel: string;
  initialName: string;
  /** Fixed text after the box, such as `.mdx`. */
  extension?: string;
  /** Resolves when the action worked; throws the refusal to show under the box. */
  onSubmit: (name: string) => Promise<void>;
  onClose: () => void;
  focusAfter: FocusTarget;
}

function NameForm({
  label,
  confirmLabel,
  initialName,
  extension,
  onSubmit,
  onClose,
}: Pick<
  NameDialogProps,
  | 'label'
  | 'confirmLabel'
  | 'initialName'
  | 'extension'
  | 'onSubmit'
  | 'onClose'
>) {
  const inputId = useId();
  const errorId = useId();
  const [name, setName] = useState(initialName);
  const [refusal, setRefusal] = useState<Refusal | null>(null);
  const [busy, setBusy] = useState(false);
  const error = refusal === null ? null : refusal.message;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    if (!isValidName(name)) {
      setRefusal({
        message:
          name.trim() === ''
            ? EMPTY_NAME_MESSAGE
            : new ContentError('invalid-path').message,
        blockedBy: [],
      });
      return;
    }
    setBusy(true);
    try {
      await onSubmit(name);
      onClose();
    } catch (cause) {
      setRefusal(refusalOf(cause));
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className='flex flex-col gap-4' noValidate>
      <div className='flex flex-col gap-1.5'>
        <Label htmlFor={inputId}>{label}</Label>
        <div className='flex items-center gap-2'>
          <Input
            id={inputId}
            value={name}
            autoComplete='off'
            spellCheck={false}
            aria-invalid={error === null ? undefined : true}
            aria-describedby={error === null ? undefined : errorId}
            onChange={(event) => {
              setName(event.target.value);
              setRefusal(null);
            }}
          />
          {extension ? (
            <span className='flex-none font-mono text-sm text-muted-foreground'>
              {extension}
            </span>
          ) : null}
        </div>
        {refusal === null ? null : (
          <div
            id={errorId}
            role='alert'
            className='flex flex-col gap-1 text-sm text-destructive'
          >
            <p className='m-0'>{refusal.message}</p>
            {refusal.blockedBy.length === 0 ? null : (
              <DocumentList referrers={refusal.blockedBy} onOpen={onClose} />
            )}
          </div>
        )}
      </div>
      <DialogFooter>
        <DialogClose render={<Button variant='ghost' />}>Cancel</DialogClose>
        <Button variant='primary' type='submit' busy={busy}>
          {confirmLabel}
        </Button>
      </DialogFooter>
    </form>
  );
}

/**
 * A small dialog with one name box: Rename, Duplicate, New folder and Rename folder. The form
 * mounts with the popup, so every opening starts with the prefilled name and no message.
 */
export function NameDialog({
  open,
  title,
  description,
  focusAfter,
  onClose,
  ...form
}: NameDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent
        size='sm'
        showCloseButton={false}
        finalFocus={() => focusAfter()}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        <NameForm {...form} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
}

interface DeleteDialogProps {
  open: boolean;
  onClose: () => void;
  focusAfter: FocusTarget;
}

type ReferrerState =
  | { status: 'checking' }
  | { status: 'failed' }
  | { status: 'ready'; referrers: DocumentReferrer[] };

function ReferrerNote({ state }: { state: ReferrerState }) {
  if (state.status === 'checking') {
    return <p className='m-0'>Checking which documents link to it…</p>;
  }
  if (state.status === 'failed') {
    return <p className='m-0'>Links to it could not be checked.</p>;
  }
  const { referrers } = state;
  if (referrers.length === 0) {
    return <p className='m-0'>No other document links to it.</p>;
  }
  return (
    <div className='flex flex-col gap-1'>
      <p className='m-0'>
        {plural(
          referrers.length,
          'document links to it',
          'documents link to it'
        )}
        . They will show a missing reference.
      </p>
      <DocumentList referrers={referrers} />
    </div>
  );
}

interface DeleteDocumentBodyProps {
  path: string;
  hasDraft: boolean;
  referrersOf: (path: string) => Promise<DocumentReferrer[]>;
  deleteDocument: (path: string) => Promise<void>;
  /** Called when the row should leave without a delete, because someone deleted the document already. */
  onGone: () => void;
  onDeleted: () => void;
  onClose: () => void;
}

function DeleteDocumentBody({
  path,
  hasDraft,
  referrersOf,
  deleteDocument,
  onGone,
  onDeleted,
  onClose,
}: DeleteDocumentBodyProps) {
  const [state, setState] = useState<ReferrerState>({ status: 'checking' });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const lookup = useRef(referrersOf);
  const fileName = nameOf(path);

  useEffect(() => {
    let current = true;
    lookup
      .current(path)
      .then((referrers) => {
        if (current) setState({ status: 'ready', referrers });
      })
      .catch(() => {
        if (current) setState({ status: 'failed' });
      });
    return () => {
      current = false;
    };
  }, [path]);

  const confirm = async () => {
    setBusy(true);
    try {
      await deleteDocument(path);
      onDeleted();
      toast({ tone: 'success', title: `Deleted ${fileName}` });
      onClose();
    } catch (cause) {
      if (cause instanceof ContentError && cause.code === 'not-found') {
        onGone();
        onClose();
        return;
      }
      setError(messageOf(cause));
      setBusy(false);
    }
  };

  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>{`Delete “${fileName}”?`}</AlertDialogTitle>
        <AlertDialogDescription render={<div />}>
          <div className='flex flex-col gap-2'>
            <p className='m-0'>This deletes the file. It cannot be undone.</p>
            <ReferrerNote state={state} />
            {hasDraft ? (
              <p className='m-0'>Your unsaved edits to it go too.</p>
            ) : null}
          </div>
        </AlertDialogDescription>
      </AlertDialogHeader>
      {error === null ? null : (
        <p role='alert' className='m-0 text-sm text-destructive'>
          {error}
        </p>
      )}
      <AlertDialogFooter>
        <Button variant='ghost' onClick={onClose}>
          Cancel
        </Button>
        <Button variant='destructive' busy={busy} onClick={confirm}>
          Delete
        </Button>
      </AlertDialogFooter>
    </>
  );
}

export function DeleteDocumentDialog({
  open,
  onClose,
  focusAfter,
  ...body
}: DeleteDialogProps & Omit<DeleteDocumentBodyProps, 'onClose'>) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <AlertDialogContent finalFocus={() => focusAfter()}>
        <DeleteDocumentBody {...body} onClose={onClose} />
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface DeleteFolderBodyProps {
  name: string;
  path: string;
  documentCount: number;
  /** How many documents hold unsaved edits in the folder, unsaved copies included. */
  draftCount: number;
  deleteFolder: (folder: string) => Promise<{ deleted: string[] }>;
  onDeleted: () => void;
  onClose: () => void;
}

function DeleteFolderBody({
  name,
  path,
  documentCount,
  draftCount,
  deleteFolder,
  onDeleted,
  onClose,
}: DeleteFolderBodyProps) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const confirm = async () => {
    setBusy(true);
    try {
      await deleteFolder(path);
      onDeleted();
      toast({ tone: 'success', title: `Deleted ${name}` });
      onClose();
    } catch (cause) {
      setError(messageOf(cause));
      setBusy(false);
    }
  };

  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>{`Delete “${name}/”?`}</AlertDialogTitle>
        <AlertDialogDescription render={<div />}>
          <div className='flex flex-col gap-2'>
            <p className='m-0'>
              {`This deletes the folder and ${plural(documentCount, 'document', 'documents')} in it. It cannot be undone.`}
            </p>
            {draftCount > 0 ? (
              <p className='m-0'>
                {`Your unsaved edits to ${plural(draftCount, 'document', 'documents')} in it go too.`}
              </p>
            ) : null}
          </div>
        </AlertDialogDescription>
      </AlertDialogHeader>
      {error === null ? null : (
        <p role='alert' className='m-0 text-sm text-destructive'>
          {error}
        </p>
      )}
      <AlertDialogFooter>
        <Button variant='ghost' onClick={onClose}>
          Cancel
        </Button>
        <Button variant='destructive' busy={busy} onClick={confirm}>
          Delete
        </Button>
      </AlertDialogFooter>
    </>
  );
}

export function DeleteFolderDialog({
  open,
  onClose,
  focusAfter,
  ...body
}: DeleteDialogProps & Omit<DeleteFolderBodyProps, 'onClose'>) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <AlertDialogContent finalFocus={() => focusAfter()}>
        <DeleteFolderBody {...body} onClose={onClose} />
      </AlertDialogContent>
    </AlertDialog>
  );
}
