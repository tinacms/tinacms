import { type VariantProps, cva } from 'class-variance-authority';
import type { ComponentProps, ReactNode } from 'react';

import { Icon } from '@tinacms/ui/components/icon';
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

type BadgeStatus =
  | 'published'
  | 'draft'
  | 'changed'
  | 'committed'
  | 'merged'
  | 'failed';
type BadgeTone = Exclude<
  NonNullable<VariantProps<typeof badgeVariants>['tone']>,
  'none'
>;

const STATUS: Record<BadgeStatus, { text: string; tone: BadgeTone }> = {
  published: { text: 'Published', tone: 'success' },
  merged: { text: 'Merged', tone: 'success' },
  committed: { text: 'Committed', tone: 'neutral' },
  draft: { text: 'Draft', tone: 'outline' },
  changed: { text: 'Changed', tone: 'warning' },
  failed: { text: 'Failed', tone: 'danger' },
};

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
    /** In the corner of an icon button, hidden from screen readers: put the number in the button's name. 0 renders nothing. */
    | { kind: 'count'; count?: number; corner: true; srLabel?: never }
    /** Inline, so screen readers need words such as "3 unsaved changes". 0 renders nothing. */
    | { kind: 'count'; count?: number; corner?: false; srLabel: string }
    | { kind: 'number'; count: number }
    /** Without `srLabel` it is hidden from screen readers, for a row that already says it. */
    | { kind: 'errors'; count: number; srLabel?: string }
    | { kind: 'dot'; srLabel?: string }
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
      const { kind: _kind, srLabel, end = false, className, ...rest } = props;
      return (
        <>
          <span
            data-slot='badge'
            title={srLabel}
            aria-hidden={srLabel ? undefined : true}
            className={cn(dotVariants({ end }), className)}
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
      if (props.corner === true) {
        const { kind, count, corner, srLabel: _srLabel, ...rest } = props;
        return (
          <Pill variant={{ kind, corner }} aria-hidden {...rest}>
            {count}
          </Pill>
        );
      }
      const { kind, count, corner: _corner, srLabel, ...rest } = props;
      return (
        <Pill variant={{ kind }} title={srLabel} {...rest}>
          <span aria-hidden='true'>{count}</span>
          {srOnly(srLabel)}
        </Pill>
      );
    }
    case 'number': {
      const { kind, count, ...rest } = props;
      return (
        <Pill variant={{ kind }} {...rest}>
          {count}
        </Pill>
      );
    }
    case 'errors': {
      const { kind, count, srLabel, ...rest } = props;
      return (
        <Pill
          variant={{ kind }}
          aria-hidden={srLabel ? undefined : true}
          {...rest}
        >
          <Icon glyph='error' size={12} />
          <span aria-hidden='true'>{count}</span>
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

export type { BadgeKind, BadgeProps, BadgeStatus, BadgeTone };
export { Badge };
