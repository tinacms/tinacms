import { cva } from 'class-variance-authority';
import { type ComponentProps, Fragment, type ReactNode } from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@tinacms/ui/components/dropdown-menu';
import { type Glyph, Icon } from '@tinacms/ui/components/icon';
import { cn } from '@tinacms/ui/lib/utils';

type BreadcrumbStep = {
  label: string;
  onClick?: () => void;
  /** Makes the step a link instead of a button. */
  href?: string;
  /** The last step is the current page unless it has `onClick` or `href`. */
  current?: boolean;
  /** The open document's file, shown on hover. */
  file?: string;
};

type BreadcrumbSize = 'md' | 'sm';

const stepVariants = cva(
  'block truncate rounded-sm border-0 bg-transparent font-sans text-slate-600 no-underline outline-none hover:bg-muted hover:text-foreground focus-visible:shadow-focus-ring',
  {
    variants: {
      size: {
        md: 'max-w-60 px-1.5 py-1 text-base',
        sm: 'max-w-50 px-1 py-0.5 text-sm',
      },
      current: {
        true: 'cursor-default font-medium text-foreground hover:bg-transparent',
        false: 'cursor-pointer',
      },
    },
    defaultVariants: { size: 'md', current: false },
  }
);

const foldVariants = cva(
  'inline-flex flex-none cursor-pointer items-center justify-center rounded-sm border-0 bg-transparent p-0 text-slate-600 outline-none hover:bg-muted hover:text-foreground focus-visible:shadow-focus-ring data-popup-open:bg-muted data-popup-open:text-foreground',
  {
    variants: { size: { md: 'size-7', sm: 'size-6' } },
    defaultVariants: { size: 'md' },
  }
);

type FoldItem = {
  label: string;
  onClick?: () => void;
  /** Shown after the words, such as a count badge or the unsaved dot. */
  marks?: ReactNode;
};

type BreadcrumbFoldProps = Omit<
  ComponentProps<typeof DropdownMenuTrigger>,
  'children'
> & {
  /** The folded levels, top first. */
  items: readonly FoldItem[];
  /** The icon before each level in the menu. */
  icon?: Glyph | null;
  size?: BreadcrumbSize;
  /** What the trigger shows. The more icon by default. */
  children?: ReactNode;
};

/**
 * The button for the folded levels of a breadcrumb or a field trail, and the menu
 * of those levels it opens. Escape closes the menu and returns focus here.
 */
function BreadcrumbFold({
  items,
  icon = 'folder',
  size = 'md',
  children,
  className,
  ...props
}: BreadcrumbFoldProps) {
  const label = `Show ${items.length} more ${items.length === 1 ? 'level' : 'levels'}`;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={label}
        className={cn(foldVariants({ size }), className)}
        {...props}
      >
        {children ?? <Icon glyph='more' size={16} />}
      </DropdownMenuTrigger>
      <DropdownMenuContent aria-label={label} className='w-60'>
        {items.map((item, index) => (
          <DropdownMenuItem
            // Two levels can share a name, so the position is the key.
            key={index}
            icon={icon ?? undefined}
            onClick={item.onClick}
          >
            <span className='flex min-w-0 items-center gap-1.5'>
              <span className='min-w-0 truncate'>{item.label}</span>
              {item.marks}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

type BreadcrumbProps = Omit<ComponentProps<'nav'>, 'children'> & {
  /** Top first. The separators are drawn for you. */
  items: readonly BreadcrumbStep[];
  /** sm inside a panel header or the preview bar. */
  size?: BreadcrumbSize;
  /** Steps shown before the middle folds into a menu. Never fewer than 3. */
  max?: number;
};

/**
 * Where the open document sits. Each step above it is a Tab stop that goes back;
 * the last step is the page itself, marked as the current page.
 * A longer path keeps the first step and the last two, and folds the rest.
 */
function Breadcrumb({
  items,
  size = 'md',
  max = 3,
  'aria-label': label = 'Breadcrumb',
  className,
  ...props
}: BreadcrumbProps) {
  const fold = items.length > Math.max(3, max);
  const hidden = fold ? items.slice(1, -2) : [];
  const shown: (BreadcrumbStep | null)[] = fold
    ? [items[0], null, ...items.slice(-2)]
    : [...items];

  return (
    <nav
      data-slot='breadcrumb'
      aria-label={label}
      className={cn(
        'flex max-w-full min-w-0 items-center font-sans leading-control text-foreground',
        className
      )}
      {...props}
    >
      <ol className='m-0 flex min-w-0 list-none items-center overflow-hidden p-0'>
        {shown.map((step, index) => {
          const current =
            step !== null &&
            (Boolean(step.current) ||
              (index === shown.length - 1 && !step.onClick && !step.href));
          return (
            // Two steps can share a name, so the position is the key.
            <Fragment key={index}>
              {index > 0 ? (
                <li
                  aria-hidden='true'
                  className='flex-none px-px text-muted-foreground select-none'
                >
                  ›
                </li>
              ) : null}
              <li
                className={cn(
                  'flex min-w-0 items-center',
                  (index === 0 || step === null) && 'flex-none'
                )}
              >
                {step === null ? (
                  <BreadcrumbFold
                    size={size}
                    items={hidden.map(({ label, onClick }) => ({
                      label,
                      onClick,
                    }))}
                  />
                ) : current ? (
                  <span
                    aria-current='page'
                    title={step.file}
                    className={stepVariants({ size, current: true })}
                  >
                    {step.label}
                  </span>
                ) : step.href ? (
                  <a
                    href={step.href}
                    onClick={step.onClick}
                    className={stepVariants({ size })}
                  >
                    {step.label}
                  </a>
                ) : (
                  <button
                    type='button'
                    onClick={step.onClick}
                    className={stepVariants({ size })}
                  >
                    {step.label}
                  </button>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

export type { BreadcrumbFoldProps, BreadcrumbProps, BreadcrumbStep, FoldItem };
export { Breadcrumb, BreadcrumbFold };
