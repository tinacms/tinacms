import { cva } from 'class-variance-authority';
import type { LucideIcon } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';

import { Badge, type BadgeTone } from '@tinacms/ui/components/badge';
import { Button } from '@tinacms/ui/components/button';
import { DiffStat } from '@tinacms/ui/components/diff-stat';
import { type Glyph, Icon } from '@tinacms/ui/components/icon';
import { cn } from '@tinacms/ui/lib/utils';

const listRowVariants = cva(
  'group/list-row relative box-border flex w-full min-w-0 items-center gap-1.5 rounded-sm font-sans text-base leading-control text-foreground transition-colors has-[[data-slot=list-row-main]:hover]:bg-muted',
  {
    variants: {
      selected: {
        true: 'bg-selected has-[[data-slot=list-row-main]:hover]:bg-selected',
        false: '',
      },
      flush: { true: 'rounded-none', false: '' },
      disabled: {
        true: 'has-[[data-slot=list-row-main]:hover]:bg-transparent',
        false: '',
      },
    },
    defaultVariants: { selected: false, flush: false, disabled: false },
  }
);

const mainVariants = cva(
  'm-0 box-border flex min-h-11 min-w-0 flex-auto cursor-pointer items-center gap-3 rounded-sm border-0 bg-transparent px-2.5 py-1.5 text-left font-sans text-base leading-control text-inherit outline-none focus-visible:shadow-focus-inset',
  {
    variants: {
      twoLine: { true: 'min-h-13 gap-2.5 py-2', false: '' },
      flush: { true: 'rounded-none px-5', false: '' },
      disabled: { true: 'cursor-not-allowed', false: '' },
    },
    defaultVariants: { twoLine: false, flush: false, disabled: false },
  }
);

type ListRowProps = Omit<
  ComponentProps<'div'>,
  'children' | 'onClick' | 'title'
> & {
  title: string;
  /** The words of a search. Where the title matches them, without case, they show in semibold dark text. */
  match?: string;
  /** A grey lead-in before the title, such as "Collections » ". */
  prefix?: string;
  /** A second line in the code font, such as the file path. Makes it a two-line row. */
  meta?: string;
  icon?: Glyph | LucideIcon;
  /** A tag at the end, such as the collection. */
  badge?: string;
  /** `outline` (default) brings its own white fill, so it reads on the hover and selected fills. */
  badgeTone?: BadgeTone;
  /** The amber Unsaved tag: this document has edits that are not saved. Screen readers hear it after the title. */
  unsaved?: boolean;
  unsavedLabel?: string;
  /** Quiet facts at the end of a one-line row, such as a pull request number. */
  aside?: ReactNode;
  added?: number;
  removed?: number;
  /** A row that stays picked: the selected grey, semibold words and an orange icon. Announced as pressed. */
  selected?: boolean;
  onClick?: () => void;
  /** Edge to edge with no corners, as in the search dialog. */
  flush?: boolean;
  /** The words of one button after the row's own button, such as "Commit". */
  actionLabel?: string;
  /** The action's name for screen readers, such as "Commit About Tina". */
  actionAria?: string;
  onAction?: () => void;
  /** A code-like title, such as a branch name. */
  mono?: boolean;
  /**
   * The row can't be picked yet: put the reason in `meta` or `aside`. It stays focusable so the
   * reason is read, carries `aria-disabled`, and a press does nothing. No hover, no tooltip.
   */
  disabled?: boolean;
};

function Title({ title, match }: { title: string; match?: string }) {
  const at = match ? title.toLowerCase().indexOf(match.toLowerCase()) : -1;
  if (!match || at === -1) return <>{title}</>;
  return (
    <>
      {title.slice(0, at)}
      <mark className='bg-transparent font-semibold text-foreground'>
        {title.slice(at, at + match.length)}
      </mark>
      {title.slice(at + match.length)}
    </>
  );
}

/**
 * One row in a list you pick from, such as search results or the files in Changes. The row is one
 * Tab stop and the action at its end is a second. Selected is never an orange fill.
 */
function ListRow({
  title,
  match,
  prefix,
  meta,
  icon,
  badge,
  badgeTone = 'outline',
  unsaved = false,
  unsavedLabel = 'Unsaved',
  aside,
  added,
  removed,
  selected,
  onClick,
  flush = false,
  actionLabel,
  actionAria,
  onAction,
  mono = false,
  disabled = false,
  className,
  ...props
}: ListRowProps) {
  const on = Boolean(selected);
  const hasDiff = added !== undefined || removed !== undefined;
  return (
    <div
      data-slot='list-row'
      className={cn(
        listRowVariants({ selected: on, flush, disabled }),
        className
      )}
      {...props}
    >
      <button
        type='button'
        data-slot='list-row-main'
        aria-pressed={selected === undefined ? undefined : on}
        aria-disabled={disabled ? true : undefined}
        onClick={disabled ? undefined : onClick}
        className={mainVariants({ twoLine: Boolean(meta), flush, disabled })}
      >
        {icon ? (
          <span
            className={cn(
              'inline-flex flex-none text-muted-foreground',
              on && 'text-primary',
              disabled && 'text-muted-foreground-strong'
            )}
          >
            <Icon glyph={icon} size={16} />
          </span>
        ) : null}
        <span className='flex min-w-0 flex-auto flex-col'>
          <span
            className={cn(
              'min-w-0 truncate',
              meta && 'font-medium',
              on && 'font-semibold',
              mono && 'font-mono tracking-code',
              disabled && 'text-muted-foreground-strong'
            )}
          >
            {prefix ? <span className='text-slate-600'>{prefix}</span> : null}
            <Title title={title} match={match} />
          </span>
          {meta ? (
            <span
              className={cn(
                'min-w-0 truncate font-mono text-xs tracking-code text-muted-foreground',
                mono && 'font-sans tracking-normal',
                on && 'text-muted-foreground-strong'
              )}
            >
              {meta}
            </span>
          ) : null}
        </span>
        {unsaved || badge || hasDiff || aside ? (
          <span className='ml-auto inline-flex flex-none items-center gap-2 text-xs font-normal text-muted-foreground'>
            {aside}
            {unsaved ? <Badge kind='unsaved'>{unsavedLabel}</Badge> : null}
            {badge ? (
              badgeTone === 'outline' ? (
                <Badge kind='label'>{badge}</Badge>
              ) : (
                <Badge kind='tag' tone={badgeTone}>
                  {badge}
                </Badge>
              )
            ) : null}
            {hasDiff ? <DiffStat added={added} removed={removed} /> : null}
          </span>
        ) : null}
      </button>
      {actionLabel ? (
        <span className='inline-flex flex-none pr-2'>
          <Button size='sm' aria-label={actionAria} onClick={onAction}>
            {actionLabel}
          </Button>
        </span>
      ) : null}
    </div>
  );
}

export type { ListRowProps };
export { ListRow, listRowVariants };
