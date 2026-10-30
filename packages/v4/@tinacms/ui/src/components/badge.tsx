import { type VariantProps, cva } from 'class-variance-authority';
import type { ComponentProps, ReactNode } from 'react';

import { cn } from '@tinacms/ui/lib/utils';

const WORDS = 'h-5.5 gap-1.5 px-2.25';
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
        count: 'h-5 min-w-5 px-1.5',
      },
      countTone: {
        none: '',
        change: AMBER,
        error: 'bg-destructive text-white',
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
      countTone: 'none',
      tone: 'none',
      mono: false,
      corner: false,
      end: false,
    },
  }
);

const dotVariants = cva('inline-block size-1.75 flex-none rounded-full', {
  variants: {
    tone: {
      change: 'bg-unsaved-dot shadow-unsaved-glow',
      error: 'bg-destructive',
    },
    end: { true: 'ml-auto', false: '' },
  },
  defaultVariants: { tone: 'change', end: false },
});

type BadgeStatus = 'published' | 'draft' | 'committed' | 'merged' | 'failed';
type BadgeTone = Exclude<
  NonNullable<VariantProps<typeof badgeVariants>['tone']>,
  'none'
>;

const STATUS: Record<BadgeStatus, { text: string; tone: BadgeTone }> = {
  published: { text: 'Published', tone: 'success' },
  merged: { text: 'Merged', tone: 'success' },
  committed: { text: 'Committed', tone: 'neutral' },
  draft: { text: 'Draft', tone: 'outline' },
  failed: { text: 'Failed', tone: 'danger' },
};

type CountTone = 'error' | 'change';

type SpanProps = Omit<ComponentProps<'span'>, 'children'> & {
  /** Pushes the badge to the end of its row. */
  end?: boolean;
};

/** Each kind takes only the props it uses. */
type BadgeProps = SpanProps &
  (
    | { kind?: 'unsaved'; children?: ReactNode }
    | { kind: 'status'; status: BadgeStatus; children?: ReactNode }
    | {
        kind: 'tag';
        tone?: BadgeTone;
        /** The code font, for file types and branch names. */
        mono?: boolean;
        icon?: ReactNode;
        children: ReactNode;
      }
    | { kind: 'label'; children: ReactNode }
    /** In the corner of an icon button, hidden from screen readers: put the number in the button's name. 0 renders nothing; over 99 shows "99+". */
    | {
        kind: 'count';
        count?: number;
        tone?: CountTone;
        corner: true;
        srLabel?: never;
      }
    /** Inline, so screen readers need words such as ", 3 errors". 0 renders nothing; over 99 shows "99+". */
    | {
        kind: 'count';
        count?: number;
        tone?: CountTone;
        corner?: false;
        srLabel: string;
      }
    /** `tone='error'` is the red dot on a step or card that holds an error. */
    | { kind: 'dot'; tone?: CountTone; srLabel?: string }
  );

type PillProps = SpanProps & {
  variant: Omit<VariantProps<typeof badgeVariants>, 'end'>;
  children?: ReactNode;
};

function Pill({ variant, end = false, className, ...props }: PillProps) {
  return (
    <span
      data-slot='badge'
      className={cn(badgeVariants({ ...variant, end }), className)}
      {...props}
    />
  );
}

const srOnly = (label?: string) =>
  label ? <span className='sr-only'>{label}</span> : null;

/** A small pill for state, counts and tags: Unsaved, Published, a file type, a number of errors. */
function Badge(props: BadgeProps) {
  switch (props.kind) {
    case 'dot': {
      const {
        kind: _kind,
        tone = 'change',
        srLabel,
        end = false,
        className,
        ...rest
      } = props;
      return (
        <>
          <span
            data-slot='badge'
            title={srLabel}
            aria-hidden={srLabel ? undefined : true}
            className={cn(dotVariants({ tone, end }), className)}
            {...rest}
          />
          {srOnly(srLabel)}
        </>
      );
    }
    case 'status': {
      const { kind, status, children, ...rest } = props;
      return (
        <Pill variant={{ kind, tone: STATUS[status].tone }} {...rest}>
          <span
            aria-hidden='true'
            className='inline-block size-1.5 flex-none rounded-full bg-current'
          />
          {children ?? STATUS[status].text}
        </Pill>
      );
    }
    case 'tag': {
      const {
        kind,
        tone = 'neutral',
        mono = false,
        icon,
        children,
        ...rest
      } = props;
      return (
        <Pill variant={{ kind, tone, mono }} {...rest}>
          {icon}
          {children}
        </Pill>
      );
    }
    case 'label': {
      const { kind, ...rest } = props;
      return <Pill variant={{ kind }} {...rest} />;
    }
    case 'count': {
      if (!props.count) return null;
      const shown = props.count > 99 ? '99+' : props.count;
      if (props.corner === true) {
        const {
          kind,
          count: _count,
          tone = 'change',
          corner,
          srLabel: _srLabel,
          ...rest
        } = props;
        return (
          <Pill
            variant={{ kind, countTone: tone, corner }}
            aria-hidden
            {...rest}
          >
            {shown}
          </Pill>
        );
      }
      const {
        kind,
        count: _count,
        tone = 'change',
        corner: _corner,
        srLabel,
        ...rest
      } = props;
      return (
        <Pill
          variant={{ kind, countTone: tone }}
          title={tone === 'change' ? srLabel : undefined}
          {...rest}
        >
          <span aria-hidden='true'>{shown}</span>
          {srOnly(srLabel)}
        </Pill>
      );
    }
    case undefined:
    case 'unsaved': {
      const { kind: _kind, children, ...rest } = props;
      return (
        <Pill variant={{ kind: 'unsaved' }} {...rest}>
          <span aria-hidden='true' className={dotVariants()} />
          {children ?? 'Unsaved'}
        </Pill>
      );
    }
    default: {
      const unhandled: never = props;
      return unhandled;
    }
  }
}

type BadgeKind = NonNullable<BadgeProps['kind']>;

export type { BadgeKind, BadgeProps, BadgeStatus, BadgeTone, CountTone };
export { Badge };
