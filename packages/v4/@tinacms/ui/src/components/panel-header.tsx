import type { ComponentProps, ReactElement, ReactNode } from 'react';

import {
  Breadcrumb,
  type BreadcrumbStep,
} from '@tinacms/ui/components/breadcrumb';
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
  /**
   * Where the heading sits, top first. With it the bar is the 64px title-led head: the
   * trail over the heading, and no back button. Every step should have an `onClick`.
   */
  trail?: BreadcrumbStep[];
  /** Shows a back button with these words in place of the title. */
  backLabel?: string;
  backTitle?: string;
  onBack?: () => void;
  /** At most one action, as a ghost `Button size='sm'`. */
  action?: ReactElement;
  /**
   * Where the action sits. `end` puts it before the ⋯ menu, Maximise and close, for
   * an action whose words change and must not move. Tab order follows the screen.
   */
  actionAt?: 'start' | 'end';
  /** `DropdownMenuItem`s. Without them there is no ⋯ button. */
  menu?: ReactNode;
  menuLabel?: string;
  /** Shows close, with these words for screen readers. */
  closeLabel?: string;
  onClose?: () => void;
  /** Shows a Maximise button before close ("Restore" while true). Without `onMaximise` there is none. */
  maximised?: boolean;
  onMaximise?: () => void;
  /** Names the Maximise button when off and on. They default to "Maximise" and "Restore". */
  maximiseLabels?: readonly [string, string];
};

/**
 * The 44px bar at the top of every panel (64px with a `trail`): a title or a back button, at most one
 * action (after the title, or at the end with `actionAt`), then the ⋯ menu and close
 * at the end. Tab goes back, action, ⋯, maximise, close.
 */
function PanelHeader({
  heading,
  trail,
  backLabel,
  backTitle,
  onBack,
  action,
  actionAt = 'start',
  menu,
  menuLabel = heading ? `${heading} actions` : 'More actions',
  closeLabel,
  onClose,
  maximised = false,
  onMaximise,
  maximiseLabels = ['Maximise', 'Restore'],
  className,
  ...props
}: PanelHeaderProps) {
  const titled = trail !== undefined;
  return (
    <div
      data-slot='panel-header'
      className={cn(
        'relative box-border flex flex-none items-center gap-1 border-b border-border-subtle bg-card pr-1.5 font-sans text-base leading-control text-foreground',
        titled ? 'h-16 pl-4' : 'h-11 pl-2',
        className
      )}
      {...props}
    >
      {titled ? (
        <div className='flex min-w-0 flex-1 flex-col justify-center'>
          <Breadcrumb
            items={trail}
            size='sm'
            max={4}
            aria-label='Location'
            className='-ml-1 text-muted-foreground'
          />
          {heading ? (
            <h2 className='m-0 truncate text-md leading-title font-semibold text-foreground'>
              {heading}
            </h2>
          ) : null}
        </div>
      ) : backLabel ? (
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
        <h2 className='m-0 mr-1.5 min-w-0 flex-initial truncate pl-1.5 text-base leading-title font-semibold text-foreground'>
          {heading}
        </h2>
      ) : null}
      {actionAt === 'start' ? action : null}
      {titled ? null : <span aria-hidden='true' className='flex-1' />}
      {actionAt === 'end' ? action : null}
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
      {onMaximise ? (
        <Button
          variant='icon'
          size='sm'
          icon={maximised ? 'restore' : 'maximise'}
          aria-label={maximised ? maximiseLabels[1] : maximiseLabels[0]}
          aria-pressed={maximised}
          onClick={onMaximise}
        />
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
