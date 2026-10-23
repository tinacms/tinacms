import type { ComponentProps, ReactElement, ReactNode } from 'react';

import { Button } from '@tinacms/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@tinacms/ui/components/dropdown-menu';
import { cn } from '@tinacms/ui/lib/utils';

type PanelHeaderProps = Omit<ComponentProps<'div'>, 'children'> & {
  /** Long titles end in an ellipsis. A back button replaces it. */
  heading?: string;
  /** Shows a back button with these words in place of the title, such as "Return to navigator". */
  backLabel?: string;
  /** Shown on hover over the back button. */
  backTitle?: string;
  onBack?: () => void;
  /** The panel's one action after the title, such as New: a ghost `Button size='sm'`. */
  action?: ReactElement;
  /** The ⋯ menu's items, such as maximise, sort and collapse all. Without items there is no ⋯ button. */
  menu?: ReactNode;
  /** Names the ⋯ button and its menu. Defaults to "<heading> actions". */
  menuLabel?: string;
  /** Shows close, with these words for screen readers, such as "Close Collections". */
  closeLabel?: string;
  onClose?: () => void;
};

/**
 * The 44px bar at the top of every panel: a title or a back button, at most one
 * action, then the ⋯ menu and close at the end. Tab goes back, action, ⋯, close.
 */
function PanelHeader({
  heading,
  backLabel,
  backTitle,
  onBack,
  action,
  menu,
  menuLabel = heading ? `${heading} actions` : 'More actions',
  closeLabel,
  onClose,
  className,
  ...props
}: PanelHeaderProps) {
  return (
    <div
      data-slot='panel-header'
      className={cn(
        'relative box-border flex min-h-11 flex-none items-center gap-1 border-b border-border-subtle bg-card pr-1.5 pl-2 font-sans text-base leading-control text-foreground',
        className
      )}
      {...props}
    >
      {backLabel ? (
        <Button
          variant='ghost'
          size='sm'
          icon='chevron-left'
          title={backTitle}
          onClick={onBack}
        >
          {backLabel}
        </Button>
      ) : heading ? (
        <h2 className='m-0 min-w-0 flex-initial truncate pl-1.5 text-base leading-title font-semibold text-foreground'>
          {heading}
        </h2>
      ) : null}
      {action ?? null}
      <span aria-hidden='true' className='flex-1' />
      {menu ? (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant='icon' size='sm' icon='more' />}
            aria-label={menuLabel}
          />
          <DropdownMenuContent align='end' aria-label={menuLabel}>
            {menu}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
      {closeLabel ? (
        <Button
          variant='icon'
          size='sm'
          icon='close'
          aria-label={closeLabel}
          onClick={onClose}
        />
      ) : null}
    </div>
  );
}

export type { PanelHeaderProps };
export { PanelHeader };
