import { cva } from 'class-variance-authority';
import {
  type ComponentProps,
  Fragment,
  type ReactNode,
  useLayoutEffect,
  useRef,
} from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@tinacms/ui/components/dropdown-menu';
import { Icon } from '@tinacms/ui/components/icon';
import { quietControl } from '@tinacms/ui/lib/nav-styles';
import { cn } from '@tinacms/ui/lib/utils';

type BreadcrumbStep = {
  label: string;
  onClick?: () => void;
  /** Marks this step as the current page. Otherwise the last step is, unless it has `onClick`. */
  current?: boolean;
  /** The open document's file, shown on hover. */
  file?: string;
};

type BreadcrumbSize = 'md' | 'sm';

/** A longer path keeps the first step and the last two, and folds the rest. */
const MAX_STEPS = 3;

const stepVariants = cva(['block truncate', quietControl], {
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
});

const foldVariants = cva(
  [
    'inline-flex flex-none cursor-pointer items-center justify-center p-0 data-popup-open:bg-muted data-popup-open:text-foreground',
    quietControl,
  ],
  {
    variants: { size: { md: 'size-7', sm: 'size-6' } },
    defaultVariants: { size: 'md' },
  }
);

type FoldItem = { label: string; onClick?: () => void };

type BreadcrumbFoldProps = Omit<
  ComponentProps<typeof DropdownMenuTrigger>,
  'children'
> & {
  items: readonly FoldItem[];
  size?: BreadcrumbSize;
};

/** The button for the folded levels of a breadcrumb or a field trail, and the menu it opens. */
function BreadcrumbFold({
  items,
  size = 'md',
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
        <Icon glyph='more' size={16} />
      </DropdownMenuTrigger>
      <DropdownMenuContent aria-label={label} className='w-60'>
        {items.map((item, index) => (
          // Two levels can share a name, so the position is the key.
          <DropdownMenuItem key={index} icon='folder' onClick={item.onClick}>
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Step({
  step,
  current,
  size,
  onClick,
}: {
  step: BreadcrumbStep;
  current: boolean;
  size: BreadcrumbSize;
  onClick?: () => void;
}) {
  if (current) {
    return (
      <span
        aria-current='page'
        tabIndex={-1}
        title={step.file}
        className={stepVariants({ size, current: true })}
      >
        {step.label}
      </span>
    );
  }
  if (!onClick) {
    return (
      <span
        className={cn(
          stepVariants({ size }),
          'cursor-default hover:bg-transparent hover:text-slate-600'
        )}
      >
        {step.label}
      </span>
    );
  }
  return (
    <button type='button' onClick={onClick} className={stepVariants({ size })}>
      {step.label}
    </button>
  );
}

type BreadcrumbProps = Omit<ComponentProps<'nav'>, 'children'> & {
  /** Top first. The separators are drawn for you. */
  items: readonly BreadcrumbStep[];
  size?: BreadcrumbSize;
};

/**
 * Where the open document sits. Each step above it is a Tab stop that goes back;
 * the last step is the page itself, marked as the current page.
 */
function Breadcrumb({
  items,
  size = 'md',
  'aria-label': label = 'Breadcrumb',
  className,
  ...props
}: BreadcrumbProps) {
  const fold = items.length > MAX_STEPS;
  const hidden = fold ? items.slice(1, -2) : [];
  const shown: (BreadcrumbStep | null)[] = fold
    ? [items[0], null, ...items.slice(-2)]
    : [...items];
  const pinned = items.some((step) => step.current === true);

  // A pressed step often turns into the current page, a span, so its button and focus go away.
  const navRef = useRef<HTMLElement>(null);
  const refocus = useRef(false);
  const press = (onClick?: () => void) =>
    onClick
      ? () => {
          refocus.current = true;
          onClick();
        }
      : undefined;
  useLayoutEffect(() => {
    if (!refocus.current) return;
    refocus.current = false;
    const focused = document.activeElement;
    const kept = focused?.isConnected && focused !== document.body;
    if (kept && !navRef.current?.contains(focused)) return;
    navRef.current
      ?.querySelector<HTMLElement>('[aria-current="page"]')
      ?.focus();
  }, [items]);

  return (
    <nav
      ref={navRef}
      data-slot='breadcrumb'
      aria-label={label}
      className={cn(
        'flex max-w-full min-w-0 items-center font-sans leading-control text-foreground',
        className
      )}
      {...props}
    >
      <ol className='-m-1.5 flex min-w-0 list-none items-center overflow-hidden p-1.5'>
        {shown.map((step, index) => (
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
                  items={hidden.map((item) => ({
                    label: item.label,
                    onClick: press(item.onClick),
                  }))}
                />
              ) : (
                <Step
                  step={step}
                  size={size}
                  current={
                    pinned
                      ? step.current === true
                      : index === shown.length - 1 && !step.onClick
                  }
                  onClick={press(step.onClick)}
                />
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}

export type { BreadcrumbFoldProps, BreadcrumbProps, BreadcrumbStep, FoldItem };
export { Breadcrumb, BreadcrumbFold };
