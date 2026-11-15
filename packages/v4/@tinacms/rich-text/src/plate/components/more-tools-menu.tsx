import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@tinacms/ui/components/popover';
import React from 'react';
import { ToolbarButton } from './plate-ui/toolbar';
import { ToolRowContext } from './plate-ui/tooltip';
import { Icons } from './plate-ui/icons';

/** The ⋯ trigger. Tools that no longer fit in line sit in its panel, in their own buttons. */
export function MoreToolsMenu({
  children,
  disabled = false,
}: {
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <ToolbarButton tooltip='More tools...' disabled={disabled}>
            <Icons.more aria-hidden />
          </ToolbarButton>
        }
      />
      <PopoverContent
        align='end'
        aria-label='More tools'
        className='w-64 gap-0 p-1'
      >
        <ToolRowContext.Provider value>{children}</ToolRowContext.Provider>
      </PopoverContent>
    </Popover>
  );
}
