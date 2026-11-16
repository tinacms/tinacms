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
}: {
  children: React.ReactNode;
  disabled?: boolean;
}) {
  const editor = useEditorRef();
  const [open, setOpen] = React.useState(false);
  const ran = React.useRef(false);
  const row = React.useMemo(
    () => ({
      onRun: () => {
        ran.current = true;
        setOpen(false);
        editor.tf.focus();
      },
    }),
    [editor]
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
        finalFocus={() => {
          if (!ran.current) return true;
          ran.current = false;
          return false;
        }}
        className='w-64 max-w-(--available-width) gap-0 p-1'
      >
        <ToolRowContext.Provider value={row}>
          {children}
        </ToolRowContext.Provider>
      </PopoverContent>
    </Popover>
  );
}
