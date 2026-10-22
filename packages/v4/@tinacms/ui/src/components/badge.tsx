import { type VariantProps, cva } from 'class-variance-authority';
import { CircleAlert } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';

import { cn } from '@tinacms/ui/lib/utils';

const WORDS = 'h-5.5 gap-1.5 px-2.25';
const NUMBERS = 'h-5 min-w-5 px-1.75';
const AMBER =
  'bg-unsaved-subtle text-unsaved inset-ring inset-ring-unsaved-edge/20';
const OUTLINED =
  'bg-card text-muted-foreground-strong inset-ring inset-ring-border';

const badgeVariants = cva(
  'box-border inline-flex flex-none items-center justify-center rounded-full py-0 transition-all font-sans text-xs leading-none font-medium whitespace-nowrap tabular-nums [&>svg]:size-3',
  {
    variants: {
      kind: {
        unsaved: `${WORDS} pl-2 ${AMBER}`,
        status: `${WORDS} pl-2`,
        tag: WORDS,
        label: `${WORDS} ${OUTLINED}`,
        count: `${NUMBERS} ${AMBER}`,
        number: `${NUMBERS} bg-muted text-muted-foreground-strong inset-ring inset-ring-slate-700/12`,
        errors: 'h-auto gap-0.5 rounded-none px-0 text-destructive',
      },
      tone: {
        none: '',
        neutral: 'bg-muted text-slate-700 inset-ring inset-ring-slate-700/12',
        outline: OUTLINED,
        info: 'bg-tone-info-subtle text-tone-info inset-ring inset-ring-tone-info/14',
        success:
          'bg-status-published-subtle text-status-published inset-ring inset-ring-status-published/14',
        warning: AMBER,
        danger:
          'bg-status-failed-subtle text-status-failed inset-ring inset-ring-status-failed/14',
      },
      mono: { true: 'font-mono tracking-code', false: '' },
      corner: {
        true: 'pointer-events-none absolute -top-0.75 -right-0.75 ring-2 ring-card',
        false: '',
      },
      end: { true: 'ml-auto', false: '' },
    },
    defaultVariants: {
      kind: 'unsaved',
      tone: 'none',
      mono: false,
      corner: false,
      end: false,
    },
  }
);

const dotVariants = cva(
  'inline-block size-1.75 flex-none rounded-full bg-unsaved-dot shadow-unsaved-glow',
  {
    variants: { end: { true: 'ml-auto', false: '' } },
    defaultVariants: { end: false },
  }
);

type BadgeKind =
  | 'unsaved'
  | 'count'
  | 'dot'
  | 'status'
  | 'tag'
  | 'number'
  | 'label'
  | 'errors';
type BadgeStatus =
  | 'published'
  | 'draft'
  | 'changed'
  | 'committed'
  | 'merged'
  | 'failed';
type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

const STATUS: Record<
  BadgeStatus,
  { text: string; tone: VariantProps<typeof badgeVariants>['tone'] }
> = {
  published: { text: 'Published', tone: 'success' },
  merged: { text: 'Merged', tone: 'success' },
  committed: { text: 'Committed', tone: 'neutral' },
  draft: { text: 'Draft', tone: 'outline' },
  changed: { text: 'Changed', tone: 'warning' },
  failed: { text: 'Failed', tone: 'danger' },
};

type BadgeProps = Omit<ComponentProps<'span'>, 'children'> & {
  kind?: BadgeKind;
  /** With kind `status`: sets the words and the colour. */
  status?: BadgeStatus;
  /** With kind `tag`: the colour. */
  tone?: BadgeTone;
  /** With kind `tag`: the code font, for file types and branch names. */
  mono?: boolean;
  /** With kind `tag`: an icon before the words. */
  icon?: ReactNode;
  /** The words. Kinds `unsaved` and `status` have their own default words. */
  children?: ReactNode;
  /** The number for kinds `count`, `number` and `errors`. A `count` of 0 renders nothing. */
  count?: number;
  /** The words screen readers hear, also shown on hover. Set it on every `count` and `dot`. */
  srLabel?: string;
  /** Pushes the badge to the end of its row. */
  end?: boolean;
  /** With kind `count`: sits in the top corner of an icon button, hidden from screen readers. */
  corner?: boolean;
};

/** A small pill for state, counts and tags: Unsaved, Published, a file type, a number of errors. */
function Badge({
  kind = 'unsaved',
  status = 'published',
  tone = 'neutral',
  mono = false,
  icon,
  children,
  count,
  srLabel,
  end = false,
  corner = false,
  className,
  ...props
}: BadgeProps) {
  const srOnly =
    srLabel && !corner ? <span className='sr-only'>{srLabel}</span> : null;

  if (kind === 'dot') {
    return (
      <>
        <span
          data-slot='badge'
          title={srLabel}
          aria-hidden={srLabel ? undefined : true}
          className={cn(dotVariants({ end }), className)}
          {...props}
        />
        {srOnly}
      </>
    );
  }

  if (kind === 'count' && count === 0) return null;

  const classes = cn(
    badgeVariants({
      kind,
      tone:
        kind === 'status'
          ? STATUS[status].tone
          : kind === 'tag'
            ? tone
            : 'none',
      mono: kind === 'tag' && mono,
      corner: kind === 'count' && corner,
      end,
    }),
    className
  );

  const content = (() => {
    switch (kind) {
      case 'count':
        return (
          <>
            <span aria-hidden='true'>{count}</span>
            {srOnly}
          </>
        );
      case 'number':
        return count;
      case 'errors':
        return (
          <>
            <CircleAlert />
            {count}
          </>
        );
      case 'status':
        return (
          <>
            <span
              aria-hidden='true'
              className='inline-block size-1.5 flex-none rounded-full bg-current'
            />
            {children ?? STATUS[status].text}
          </>
        );
      case 'unsaved':
        return (
          <>
            <span aria-hidden='true' className={dotVariants()} />
            {children ?? 'Unsaved'}
          </>
        );
      default:
        return (
          <>
            {kind === 'tag' ? icon : null}
            {children}
          </>
        );
    }
  })();

  return (
    <span
      data-slot='badge'
      title={kind === 'count' ? srLabel : undefined}
      aria-hidden={
        (kind === 'count' && corner) || kind === 'errors' ? true : undefined
      }
      className={classes}
      {...props}
    >
      {content}
    </span>
  );
}

export type { BadgeKind, BadgeProps, BadgeStatus, BadgeTone };
export { Badge, badgeVariants };
