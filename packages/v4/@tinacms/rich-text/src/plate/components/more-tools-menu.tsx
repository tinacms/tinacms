import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@tinacms/ui/components/popover';
import { useEditorRef } from '@udecode/plate/react';
import React from 'react';
import { Icons } from './plate-ui/icons';
import { ToolRowContext } from './plate-ui/tool-row-context';
import { ToolbarButton } from './plate-ui/toolbar';

export function MoreToolsMenu({
  children,
  disabled = false,
  quiet = false,
  open,
  onOpenChange: setOpen,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  /** Keeps the panel mounted but out of sight while a box opened from inside it is showing. */
  quiet?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const editor = useEditorRef();
  const row = React.useMemo(
    () => ({
      onRun: () => {
        setOpen(false);
        editor.tf.focus();
      },
    }),
    [editor, setOpen]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <ToolbarButton tooltip='More tools...' disabled={disabled}>
            <Icons.more aria-hidden />
          </ToolbarButton>
        }
      />
      <PopoverContent
        align='end'
        collisionAvoidance={{
          side: 'flip',
          align: 'shift',
          fallbackAxisSide: 'none',
        }}
        aria-label='More tools'
        data-quiet={quiet ? '' : undefined}
        style={quiet ? { visibility: 'hidden' } : undefined}
        className='w-64 max-w-(--available-width) gap-0 p-1'
      >
        <ToolRowContext.Provider value={row}>
          {children}
        </ToolRowContext.Provider>
      </PopoverContent>
    </Popover>
  );
}
