import type { ComponentProps, ReactNode } from 'react';

import { cn } from '@tinacms/ui/lib/utils';

type TopBarProps = Omit<ComponentProps<'header'>, 'children'> & {
  /** The one side nav toggle. */
  toggle?: ReactNode;
  /** The TinaCMS logo, as an image with the alt text "TinaCMS". */
  logo?: ReactNode;
  /** Shown after the logo. Long names end in an ellipsis. */
  projectName?: string;
  /** The branch button. Leave it out when there are no branches. */
  branch?: ReactNode;
  /** The Search control. Leave it out when no search provider exists. */
  search?: ReactNode;
  /** The account button. */
  account?: ReactNode;
};

/**
 * The 44px bar along the top of the admin: toggle, logo, project name and
 * branch at the start; Search and the account button at the end. Below 768px
 * the project name and branch truncate, so nothing overflows at 375px.
 */
function TopBar({
  toggle,
  logo,
  projectName,
  branch,
  search,
  account,
  className,
  ...props
}: TopBarProps) {
  return (
    <header
      aria-label='Top bar'
      data-slot='top-bar'
      className={cn(
        'box-border flex h-11 w-full min-w-0 flex-none items-center gap-2 border-b border-border-subtle bg-card px-2 font-sans text-base leading-control text-foreground',
        className
      )}
      {...props}
    >
      <div className='flex min-w-0 flex-1 items-center gap-2'>
        {toggle}
        {logo}
        {projectName ? (
          <span
            data-slot='top-bar-project'
            className='min-w-0 truncate font-semibold'
            title={projectName}
          >
            {projectName}
          </span>
        ) : null}
        {branch ? <div className='min-w-0 flex-initial'>{branch}</div> : null}
      </div>
      <div className='flex flex-none items-center gap-1'>
        {search}
        {account}
      </div>
    </header>
  );
}

export type { TopBarProps };
export { TopBar };
