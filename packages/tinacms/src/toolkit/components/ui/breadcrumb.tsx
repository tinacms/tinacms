import { Slot } from '@radix-ui/react-slot';
import { MoreHorizontal } from 'lucide-react';
import * as React from 'react';

import { cn } from '@utils/cn';

function Breadcrumb({ ...props }: React.ComponentProps<'nav'>) {
  return <nav aria-label='breadcrumb' data-slot='breadcrumb' {...props} />;
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<'ol'>) {
  return (
    <ol
      data-slot='breadcrumb-list'
      className={cn(
        'text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm break-words',
        className
      )}
      {...props}
    />
  );
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<'li'>) {
  return (
    <li
      data-slot='breadcrumb-item'
      className={cn('inline-flex items-center gap-1.5', className)}
      {...props}
    />
  );
}

function BreadcrumbLink({
  asChild,
  className,
  ...props
}: React.ComponentProps<'a'> & {
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot : 'a';

  return (
    <Comp
      data-slot='breadcrumb-link'
      className={cn('hover:text-foreground transition-colors', className)}
      {...props}
    />
  );
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot='breadcrumb-page'
      role='link'
      aria-disabled='true'
      aria-current='page'
      className={cn('text-foreground font-normal', className)}
      {...props}
    />
  );
}

function BreadcrumbSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<'li'>) {
  return (
    <li
      data-slot='breadcrumb-separator'
      role='presentation'
      aria-hidden='true'
      className={cn('[&>svg]:size-3.5', className)}
      {...props}
    >
      {children ?? '/'}
    </li>
  );
}

function BreadcrumbEllipsis({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot='breadcrumb-ellipsis'
      role='presentation'
      aria-hidden='true'
      className={cn('flex size-9 items-center justify-center', className)}
      {...props}
    >
      <MoreHorizontal className='size-4' />
      <span className='sr-only'>More</span>
    </span>
  );
}

// A crumb that navigates somewhere when clicked.
function BreadcrumbItemLink({
  breadcrumb,
  onClick,
}: { breadcrumb: string; onClick: () => void }) {
  return (
    <BreadcrumbItem className='shrink min-w-0'>
      <BreadcrumbLink
        asChild
        className='block min-w-0 truncate text-gray-700 hover:text-orange-500'
      >
        <button type='button' onClick={onClick}>
          {breadcrumb}
        </button>
      </BreadcrumbLink>
    </BreadcrumbItem>
  );
}

// The trailing crumb. Represents where you already are, so it isn't clickable.
function FinalBreadcrumbItem({ breadcrumb }: { breadcrumb: string }) {
  return (
    <BreadcrumbItem className='shrink min-w-0'>
      <BreadcrumbPage className='block min-w-0 truncate text-gray-700 font-medium cursor-default'>
        {breadcrumb}
      </BreadcrumbPage>
    </BreadcrumbItem>
  );
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbItemLink,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
  FinalBreadcrumbItem,
};
