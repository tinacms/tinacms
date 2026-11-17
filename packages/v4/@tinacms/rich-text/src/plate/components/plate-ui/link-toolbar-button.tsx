import * as React from 'react';

import type { TRange } from '@udecode/plate';
import { CodeBlockPlugin } from '@udecode/plate-code-block/react';
import { type TLinkElement } from '@udecode/plate-link';
import { LinkPlugin } from '@udecode/plate-link/react';
import { useEditorRef, useEditorSelector } from '@udecode/plate/react';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@tinacms/ui/components/popover';
import { useTier } from '@tinacms/ui/hooks/use-tier';
import { helpers } from '../../plugins/core/common';
import { Icons } from './icons';
import {
  type LinkDraft,
  LinkBox,
  LinkSheet,
  applyLink,
} from './link-floating-toolbar';
import { LinkShortcutContext } from './link-shortcut';
import { ToolRowContext } from './tool-row-context';
import { ToolbarButton } from './toolbar';

type OpenBox = { draft: LinkDraft; selection: TRange | null };

export function LinkToolbarButton({
  disabled = false,
}: {
  disabled?: boolean;
}) {
  const editor = useEditorRef();
  const tier = useTier();
  const row = React.useContext(ToolRowContext);
  const inCodeBlock = useEditorSelector(
    (e) => helpers.isNodeActive(e, CodeBlockPlugin),
    []
  );
  const [box, setBox] = React.useState<OpenBox | null>(null);

  const openBox = () => {
    const entry = editor.api.above<TLinkElement>({
      match: { type: editor.getType(LinkPlugin) },
    });
    const draft: LinkDraft = entry
      ? { url: entry[0].url, text: editor.api.string(entry[1]) }
      : {
          url: '',
          text: editor.selection ? editor.api.string(editor.selection) : '',
        };
    setBox({ draft, selection: editor.selection });
  };

  const shortcut = React.useContext(LinkShortcutContext);
  const openRef = React.useRef(openBox);
  openRef.current = openBox;
  React.useEffect(() => {
    if (!shortcut) return;
    const open = () => openRef.current();
    shortcut.open.current = open;
    const waiting = shortcut.pending.current;
    shortcut.pending.current = false;
    const timer = waiting ? window.setTimeout(open, 50) : undefined;
    return () => {
      window.clearTimeout(timer);
      if (shortcut.open.current === open) shortcut.open.current = null;
    };
  }, [shortcut]);

  const close = (refocus: boolean) => {
    const selection = box?.selection;
    setBox(null);
    row?.onRun();
    if (!refocus) return;
    if (selection) editor.tf.select(selection);
    editor.tf.focus();
  };

  const submit = (draft: LinkDraft) => {
    if (box?.selection) editor.tf.select(box.selection);
    if (!applyLink(editor, draft)) return false;
    setBox(null);
    row?.onRun();
    editor.tf.focus();
    return true;
  };

  const content = box ? (
    <LinkBox
      initial={box.draft}
      onSubmit={submit}
      onCancel={() => close(true)}
    />
  ) : null;

  const button = (
    <ToolbarButton
      tooltip='Link'
      shortcut='⌘K'
      disabled={disabled || inCodeBlock}
      aria-haspopup='dialog'
      aria-expanded={box !== null}
      onClick={tier === 'phone' ? openBox : undefined}
      wrapTrigger={
        tier === 'phone'
          ? undefined
          : (base) => <PopoverTrigger render={base} />
      }
    >
      <Icons.link />
    </ToolbarButton>
  );

  if (tier === 'phone') {
    return (
      <>
        {button}
        <LinkSheet
          open={box !== null}
          onOpenChange={(open) => {
            if (!open) close(true);
          }}
        >
          {content}
        </LinkSheet>
      </>
    );
  }

  return (
    <Popover
      open={box !== null}
      onOpenChange={(open, details) => {
        if (open) openBox();
        else close(details.reason === 'escape-key');
      }}
    >
      {button}
      <PopoverContent
        aria-label='Link'
        initialFocus={false}
        finalFocus={false}
        className='w-80 max-w-(--available-width)'
      >
        {content}
      </PopoverContent>
    </Popover>
  );
}
