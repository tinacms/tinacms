'use client';

import * as React from 'react';

import {
  type UseVirtualFloatingOptions,
  flip,
  offset,
} from '@udecode/plate-floating';
import { type TLinkElement, getLinkAttributes } from '@udecode/plate-link';
import {
  type LinkFloatingToolbarState,
  FloatingLinkUrlInput,
  LinkPlugin,
  submitFloatingLink,
  useFloatingLinkEdit,
  useFloatingLinkEditState,
  useFloatingLinkInsert,
  useFloatingLinkInsertState,
} from '@udecode/plate-link/react';
import {
  useEditorPlugin,
  useEditorRef,
  useEditorSelection,
  useFormInputProps,
  usePluginOption,
} from '@udecode/plate/react';
import { cva } from 'class-variance-authority';
import { ExternalLink, Link, Text, Unlink, CircleX } from 'lucide-react';
import { Separator } from './separator';
import { buttonVariants } from './button';

const popoverVariants = cva(
  'z-50 w-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md outline-hidden'
);

const inputVariants = cva(
  'flex h-[28px] w-full rounded-md border-none bg-transparent px-1.5 py-1 text-base placeholder:text-muted-foreground focus-visible:ring-transparent focus-visible:outline-none md:text-sm'
);

export function LinkFloatingToolbar({
  state,
}: {
  state?: LinkFloatingToolbarState;
}) {
  const activeCommentId = usePluginOption({ key: 'comment' }, 'activeId');
  const activeSuggestionId = usePluginOption({ key: 'suggestion' }, 'activeId');
  const { api, editor } = useEditorPlugin(LinkPlugin);

  const isUrlValidator = usePluginOption(LinkPlugin, 'isUrl');

  const [currentUrl, setCurrentUrl] = React.useState('');
  const [isValidUrl, setIsValidUrl] = React.useState(true);

  const handleUrlInput = React.useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      const value = e.currentTarget.value;
      setCurrentUrl(value);
      if (value && isUrlValidator) {
        const valid = isUrlValidator(value);
        setIsValidUrl(valid);
      } else {
        setIsValidUrl(true);
      }
    },
    [isUrlValidator]
  );

  const floatingOptions: UseVirtualFloatingOptions = React.useMemo(() => {
    return {
      middleware: [
        offset(8),
        flip({
          fallbackPlacements: ['bottom-end', 'top-start', 'top-end'],
          padding: 12,
        }),
      ],
      placement:
        activeSuggestionId || activeCommentId ? 'top-start' : 'bottom-start',
    };
  }, [activeCommentId, activeSuggestionId]);

  const insertState = useFloatingLinkInsertState({
    ...state,
    floatingOptions: {
      ...floatingOptions,
      ...state?.floatingOptions,
    },
  });
  const {
    hidden,
    props: insertProps,
    ref: insertRef,
    textInputProps,
  } = useFloatingLinkInsert(insertState);

  const editState = useFloatingLinkEditState({
    ...state,
    floatingOptions: {
      ...floatingOptions,
      ...state?.floatingOptions,
    },
  });
  const {
    editButtonProps,
    props: editProps,
    ref: editRef,
    unlinkButtonProps,
  } = useFloatingLinkEdit(editState);
  const inputProps = useFormInputProps({
    preventDefaultOnEnterKeydown: true,
  });

  if (hidden) return null;

  const input = (
    <div
      className='z-[999999] flex w-[330px] flex-col relative'
      {...inputProps}
    >
      {!isValidUrl && currentUrl && (
        <div className='absolute -top-16 left-0 right-0 z-[1000000] mb-2'>
          <div
            className='bg-red-50 border border-red-200 rounded-md p-2 shadow-lg'
            role='alert'
            aria-live='polite'
          >
            <div className='flex items-center'>
              <CircleX className='size-4 text-red-500 mr-2 flex-shrink-0' />
              <span className='text-sm text-red-700 text-wrap'>
                Invalid URL. Please prefix link with https:// or use a relative
                path like /about
              </span>
            </div>
            <div className='absolute -bottom-1 left-4 w-2 h-2 bg-red-50 border-r border-b border-red-200 transform rotate-45'></div>
          </div>
        </div>
      )}

      <div className='flex items-center'>
        <div className='flex items-center pr-1 pl-2 text-muted-foreground'>
          <Link className='size-4' />
        </div>

        <FloatingLinkUrlInput
          className={inputVariants()}
          placeholder='Paste link'
          data-plate-focus
          onInput={handleUrlInput}
        />
      </div>
      <Separator className='my-1' />
      <div className='flex items-center'>
        <div className='flex items-center pr-1 pl-2 text-muted-foreground'>
          <Text className='size-4' />
        </div>
        <input
          className={inputVariants()}
          placeholder='Text to display'
          data-plate-focus
          {...textInputProps}
        />
      </div>
      <Separator className='my-1' />
      <div className='flex items-center justify-end gap-2 px-2 py-1'>
        <button
          type='button'
          className={buttonVariants({ size: 'sm', variant: 'ghost' })}
          onClick={() => {
            api.floatingLink.hide();
          }}
        >
          Cancel
        </button>
        <button
          type='button'
          className={buttonVariants({
            size: 'sm',
            variant: 'tinaPrimary',
          })}
          onClick={() => {
            if (isValidUrl || !currentUrl) {
              submitFloatingLink(editor);
            }
          }}
          disabled={!isValidUrl && !!currentUrl}
        >
          OK
        </button>
      </div>
    </div>
  );

  const editContent = editState.isEditing ? (
    input
  ) : (
    <div className='box-content flex items-center'>
      <button
        className={buttonVariants({ size: 'sm', variant: 'ghost' })}
        type='button'
        {...editButtonProps}
      >
        Edit link
      </button>

      <Separator orientation='vertical' />

      <LinkOpenButton />

      <Separator orientation='vertical' />

      <button
        className={buttonVariants({
          size: 'icon',
          variant: 'ghost',
        })}
        type='button'
        {...unlinkButtonProps}
      >
        <Unlink width={18} />
      </button>
    </div>
  );

  return (
    <>
      <div ref={insertRef} className={popoverVariants()} {...insertProps}>
        {input}
      </div>

      <div ref={editRef} className={popoverVariants()} {...editProps}>
        {editContent}
      </div>
    </>
  );
}

function LinkOpenButton() {
  const editor = useEditorRef();
  const selection = useEditorSelection();

  const attributes = React.useMemo(
    () => {
      const entry = editor.api.node<TLinkElement>({
        match: { type: editor.getType(LinkPlugin) },
      });
      if (!entry) {
        return {};
      }
      const [element] = entry;
      return getLinkAttributes(editor, element);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editor, selection]
  );

  return (
    <a
      {...attributes}
      className={buttonVariants({
        size: 'icon',
        variant: 'ghost',
      })}
      onMouseOver={(e) => {
        e.stopPropagation();
      }}
      aria-label='Open link in a new tab'
      target='_blank'
    >
      <ExternalLink width={18} />
    </a>
  );
}
