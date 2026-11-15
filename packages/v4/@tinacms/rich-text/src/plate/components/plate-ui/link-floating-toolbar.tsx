'use client';

import * as React from 'react';
import { useKeyboardInset } from '../../hooks/use-keyboard-inset';

import { PortalBody } from '@udecode/cn';
import {
  flip,
  offset,
  shift,
  useVirtualFloating,
} from '@udecode/plate-floating';
import { CodeBlockPlugin } from '@udecode/plate-code-block/react';
import {
  type TLinkElement,
  getLinkAttributes,
  unwrapLink,
  upsertLink,
} from '@udecode/plate-link';
import { LinkPlugin } from '@udecode/plate-link/react';
import {
  useEditorReadOnly,
  useEditorRef,
  useEditorSelector,
  useFocused,
  usePluginOption,
} from '@udecode/plate/react';
import { Link, Text } from 'lucide-react';

import { Button } from '@tinacms/ui/components/button';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@tinacms/ui/components/input-group';
import { Separator } from '@tinacms/ui/components/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@tinacms/ui/components/sheet';
import { useTier } from '@tinacms/ui/hooks/use-tier';
import { cn } from '@tinacms/ui/lib/utils';
import { helpers } from '../../plugins/core/common';

const INVALID_URL_MESSAGE =
  'Invalid URL. Please prefix link with https:// or use a relative path like /about';

export type LinkDraft = { url: string; text: string };

/** False when Plate's own URL check refuses an address the box accepted, such as ftp://. */
export function applyLink(
  editor: Parameters<typeof upsertLink>[0],
  { url, text }: LinkDraft
): boolean {
  return upsertLink(editor, { url, text }) === true;
}

export function LinkBox({
  initial,
  onSubmit,
  onCancel,
}: {
  initial: LinkDraft;
  onSubmit: (draft: LinkDraft) => boolean;
  onCancel: () => void;
}) {
  const isUrl = usePluginOption(LinkPlugin, 'isUrl');
  const [url, setUrl] = React.useState(initial.url);
  const [text, setText] = React.useState(initial.text);
  const [invalid, setInvalid] = React.useState(false);
  const urlRef = React.useRef<HTMLInputElement>(null);
  const errorId = React.useId();

  React.useEffect(() => {
    const input = urlRef.current;
    if (!input) return;
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  }, []);

  const isValid = (value: string) =>
    value.length > 0 && (isUrl ? isUrl(value) : true);

  const submit = () => {
    const trimmed = url.trim();
    if (!isValid(trimmed)) {
      setInvalid(true);
      return;
    }
    if (!onSubmit({ url: trimmed, text })) setInvalid(true);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      submit();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      onCancel();
    }
  };

  return (
    <div className='flex flex-col gap-2' onKeyDown={onKeyDown}>
      <InputGroup>
        <InputGroupAddon>
          <Link />
        </InputGroupAddon>
        <InputGroupInput
          ref={urlRef}
          type='url'
          inputMode='url'
          aria-label='Link'
          placeholder='Paste link'
          value={url}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? errorId : undefined}
          onChange={(event) => {
            const next = event.target.value;
            setUrl(next);
            setInvalid(next.length > 0 && !isValid(next.trim()));
          }}
        />
      </InputGroup>
      {invalid ? (
        <p id={errorId} role='alert' className='text-sm text-destructive'>
          {INVALID_URL_MESSAGE}
        </p>
      ) : null}
      <InputGroup>
        <InputGroupAddon>
          <Text />
        </InputGroupAddon>
        <InputGroupInput
          type='text'
          aria-label='Text to display'
          placeholder='Text to display'
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
      </InputGroup>
      <div className='flex items-center justify-end gap-2'>
        <Button variant='ghost' size='sm' onClick={onCancel}>
          Cancel
        </Button>
        <Button variant='primary' size='sm' onClick={submit}>
          OK
        </Button>
      </div>
    </div>
  );
}

export function LinkSheet({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  const inset = useKeyboardInset();
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side='bottom'
        style={{ bottom: inset }}
        showCloseButton={false}
        initialFocus={false}
        className='pb-[env(safe-area-inset-bottom)]'
      >
        <SheetHeader>
          <SheetTitle>Link</SheetTitle>
        </SheetHeader>
        <div className='p-4'>{children}</div>
      </SheetContent>
    </Sheet>
  );
}

function useLinkEntry() {
  return useEditorSelector(
    (editor) =>
      editor.selection
        ? (editor.api.above<TLinkElement>({
            match: { type: editor.getType(LinkPlugin) },
          }) ?? null)
        : null,
    [],
    { equalityFn: (a, b) => a?.[0] === b?.[0] }
  );
}

export function LinkFloatingToolbar() {
  const editor = useEditorRef();
  const readOnly = useEditorReadOnly();
  const focused = useFocused();
  const tier = useTier();
  const entry = useLinkEntry();
  const inCodeBlock = useEditorSelector(
    (e) => helpers.isNodeActive(e, CodeBlockPlugin),
    []
  );
  const [editingState, setEditing] = React.useState<{
    element: TLinkElement;
    draft: LinkDraft;
    selection: typeof editor.selection;
  } | null>(null);
  const [barFocused, setBarFocused] = React.useState(false);

  const element = entry?.[0];
  const path = entry?.[1];
  const editing = editingState?.element === element ? editingState : null;
  const visible =
    !readOnly &&
    !inCodeBlock &&
    element !== undefined &&
    (focused || barFocused || editing !== null);

  React.useEffect(() => {
    if (!visible || editingState?.element !== element) setEditing(null);
  }, [visible, element, editingState]);

  const floating = useVirtualFloating({
    open: visible,
    getBoundingClientRect: () => {
      const node = element ? editor.api.toDOMNode(element) : undefined;
      return node?.getBoundingClientRect() ?? new DOMRect();
    },
    placement: 'bottom-start',
    middleware: [
      offset(8),
      flip({ fallbackPlacements: ['top-start', 'bottom-end', 'top-end'] }),
      shift({ padding: 8 }),
    ],
  });

  const { update } = floating;
  React.useEffect(() => {
    if (visible) update?.();
  }, [visible, update, element]);

  if (!visible || !element || !path) return null;

  const href = getLinkAttributes(editor, element).href;

  const closeEditing = () => {
    setEditing(null);
    editor.tf.focus();
  };

  const startEditing = () =>
    setEditing({
      element,
      draft: { url: element.url, text: editor.api.string(path) },
      selection: editor.selection,
    });

  const submit = (draft: LinkDraft) => {
    if (editing?.selection) editor.tf.select(editing.selection);
    if (!applyLink(editor, draft)) return false;
    closeEditing();
    return true;
  };

  const remove = () => {
    unwrapLink(editor, { at: path });
    editor.tf.focus();
  };

  const box = editing ? (
    <LinkBox
      initial={editing.draft}
      onSubmit={submit}
      onCancel={closeEditing}
    />
  ) : null;

  if (editing && tier === 'phone') {
    return (
      <LinkSheet
        open
        onOpenChange={(open) => {
          if (!open) closeEditing();
        }}
      >
        {box}
      </LinkSheet>
    );
  }

  return (
    <PortalBody>
      <div
        ref={floating.refs.setFloating}
        style={floating.style}
        onFocus={() => setBarFocused(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setBarFocused(false);
          }
        }}
        onMouseDown={(event) => {
          if (!(event.target instanceof HTMLInputElement)) {
            event.preventDefault();
          }
        }}
        className='z-50'
      >
        {box ? (
          <div className='w-80 max-w-[calc(100vw-1rem)] rounded-md bg-popover p-2 shadow-popover inset-ring inset-ring-border'>
            {box}
          </div>
        ) : (
          <div
            role='toolbar'
            aria-label='Link'
            className={cn(
              'flex max-w-[calc(100vw-1rem)] items-center gap-1 rounded-md bg-popover p-1 font-sans shadow-popover inset-ring inset-ring-border'
            )}
          >
            <span className='max-w-60 truncate px-2 text-sm text-muted-foreground'>
              {element.url}
            </span>
            {href ? (
              <Button
                variant='icon'
                size='sm'
                icon='external'
                href={href}
                aria-label='Open link in a new tab'
                {...{ target: '_blank', rel: 'noopener noreferrer' }}
              />
            ) : (
              <Button
                variant='icon'
                size='sm'
                icon='external'
                disabled
                aria-label='Open link in a new tab'
              />
            )}
            <Button
              variant='icon'
              size='sm'
              icon='edit'
              aria-label='Edit link'
              onClick={startEditing}
            />
            <Separator orientation='vertical' tone='strong' className='h-5' />
            <Button
              variant='icon'
              size='sm'
              destructive
              aria-label='Remove link'
              onClick={remove}
            />
          </div>
        )}
      </div>
    </PortalBody>
  );
}
