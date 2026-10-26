import { cva } from 'class-variance-authority';
import type { LucideIcon } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';

import { Badge } from '@tinacms/ui/components/badge';
import { type Glyph, Icon } from '@tinacms/ui/components/icon';
import { cn } from '@tinacms/ui/lib/utils';

type NavRowKind = 'group' | 'folder' | 'doc' | 'more' | 'section';

const navRowVariants = cva(
  [
    'group/nav-row relative m-0 box-border flex min-h-8.5 w-full cursor-pointer items-center gap-2 rounded-sm border-0 bg-transparent py-1.5 pr-2.5 pl-1.5 text-left font-sans text-base leading-control text-slate-600 no-underline outline-none',
    'hover:bg-muted hover:text-foreground focus-visible:shadow-focus-ring',
  ],
  {
    variants: {
      kind: {
        group: 'font-medium text-foreground',
        folder: 'font-medium text-foreground',
        doc: '',
        more: 'text-sm text-muted-foreground-strong underline underline-offset-3',
        section: 'gap-2.5 px-2.5 hover:text-slate-600',
      },
      selected: {
        true: 'bg-selected font-semibold text-foreground hover:bg-selected hover:text-foreground',
        false: '',
      },
      nested: { true: '', false: '' },
    },
    compoundVariants: [
      {
        selected: true,
        nested: true,
        className:
          'before:absolute before:top-1.5 before:bottom-1.5 before:-left-2.75 before:w-0.5 before:rounded-full before:bg-foreground',
      },
    ],
    defaultVariants: { kind: 'doc', selected: false, nested: false },
  }
);

/** Each kind takes only the props it uses. */
type NavRowKindProps =
  | {
      kind?: 'doc';
      /** A file type such as `MDX` or `{ }`, shown in place of the icon. */
      fmt?: string;
      /** Shows the amber unsaved dot, or the Unsaved tag with `unsavedLook='badge'`. */
      unsaved?: boolean;
      /** Screen readers hear it for the dot. The tag shows it. */
      unsavedLabel?: string;
    }
  | {
      kind: 'group' | 'folder';
      open?: boolean;
      /** Shown from 1. */
      count?: number;
      /** Defaults to "N unsaved". */
      countLabel?: string;
    }
  | { kind: 'more' }
  | {
      kind: 'section';
      /** It opens a panel beside the side nav. */
      opens?: boolean;
    };

type NavRowCommonProps = {
  /** Long words end in an ellipsis. Put the full name in `title`. */
  children?: ReactNode;
  /** Groups, folders and documents have one by default. */
  icon?: Glyph | LucideIcon;
  selected?: boolean;
  /** A grey outlined label. */
  badge?: string;
  /** `badge` puts unsaved edits in words, so editors can find them again. */
  unsavedLook?: 'dot' | 'badge';
};

type NavRowContentProps = NavRowKindProps &
  NavRowCommonProps & {
    external?: boolean;
  };

type MarkProps = Pick<NavRowCommonProps, 'badge' | 'unsavedLook'>;

function Lead({
  glyph,
  selected,
}: {
  glyph: Glyph | LucideIcon | undefined;
  selected: boolean;
}) {
  return glyph ? (
    <span
      data-slot='nav-row-icon'
      className={cn(
        'inline-flex flex-none text-muted-foreground',
        selected && 'text-primary'
      )}
    >
      <Icon glyph={glyph} size={16} />
    </span>
  ) : null;
}

function Label({
  children,
  external = false,
}: {
  children: ReactNode;
  external?: boolean;
}) {
  return (
    <span data-slot='nav-row-label' className='min-w-0 flex-1 truncate'>
      {children}
      {external ? <span className='sr-only'> (opens in a new tab)</span> : null}
    </span>
  );
}

function Chevron({ open = false, end = false }) {
  return (
    <span
      className={cn(
        'inline-flex flex-none text-muted-foreground-strong transition-transform',
        end && 'ml-auto',
        open && 'rotate-90'
      )}
    >
      <Icon glyph='chevron-right' size={14} />
    </span>
  );
}

const Gap = () => <span aria-hidden='true' className='w-3.5 flex-none' />;

function LabelBadge({ badge }: MarkProps) {
  return badge ? <Badge kind='label'>{badge}</Badge> : null;
}

type PartProps = Pick<NavRowCommonProps, 'children' | 'icon' | 'badge'> & {
  selected: boolean;
  /** Unsaved edits show as the Unsaved tag in words. */
  tag: boolean;
};

type KindOf<K extends NavRowKind> = Extract<
  NavRowKindProps,
  { kind: K } | { kind?: K }
>;

function BranchParts({
  kind,
  open = false,
  count = 0,
  countLabel = `${count} unsaved`,
  children,
  icon,
  badge,
  selected,
  tag,
}: KindOf<'group' | 'folder'> & PartProps) {
  const glyph =
    kind === 'group' ? 'collection' : open ? 'folder-open' : 'folder';
  const mark = tag ? (
    <Badge>{countLabel}</Badge>
  ) : (
    <Badge kind='count' count={count} srLabel={countLabel} />
  );
  return (
    <>
      <Chevron open={open} />
      <Lead glyph={icon ?? glyph} selected={selected} />
      <Label>{children}</Label>
      <LabelBadge badge={badge} />
      {count > 0 ? mark : null}
    </>
  );
}

function DocParts({
  fmt,
  unsaved = false,
  unsavedLabel = 'Unsaved',
  children,
  icon,
  badge,
  selected,
  tag,
}: KindOf<'doc'> & PartProps) {
  const mark = tag ? (
    <Badge>{unsavedLabel}</Badge>
  ) : (
    <Badge kind='dot' srLabel={unsavedLabel} />
  );
  return (
    <>
      <Gap />
      <Lead glyph={icon ?? (fmt ? undefined : 'doc')} selected={selected} />
      {fmt ? (
        <span
          aria-hidden='true'
          className={cn(
            'w-5.5 flex-none text-center font-mono text-3xs font-bold tracking-format text-muted-foreground',
            selected && 'text-primary'
          )}
        >
          {fmt}
        </span>
      ) : null}
      <Label>{children}</Label>
      <LabelBadge badge={badge} />
      {unsaved ? mark : null}
    </>
  );
}

function SectionParts({
  opens = false,
  children,
  icon,
  badge,
  selected,
}: KindOf<'section'> & PartProps) {
  return (
    <>
      <Lead glyph={icon} selected={selected} />
      <Label>{children}</Label>
      <LabelBadge badge={badge} />
      {opens ? <Chevron end /> : null}
    </>
  );
}

/** What sits inside a row, for a control that draws the row's box with `navRowVariants`. */
function NavRowContent({
  selected = false,
  unsavedLook = 'dot',
  external = false,
  ...props
}: NavRowContentProps) {
  const shared = { selected, tag: unsavedLook === 'badge' };
  if (external) {
    return (
      <>
        <Lead glyph={props.icon} selected={selected} />
        <Label external>{props.children}</Label>
        <Icon glyph='external' size={14} />
      </>
    );
  }
  switch (props.kind) {
    case 'group':
    case 'folder':
      return <BranchParts {...props} {...shared} />;
    case 'section':
      return <SectionParts {...props} {...shared} />;
    case 'more':
      return (
        <>
          <Gap />
          <Label>{props.children}</Label>
        </>
      );
    default:
      return <DocParts {...props} {...shared} />;
  }
}

type RowDomProps = Omit<ComponentProps<'button'>, 'children' | 'type'>;

type NavRowProps = NavRowKindProps &
  NavRowCommonProps &
  RowDomProps & {
    type?: ComponentProps<'button'>['type'];
    /** Inside a group or folder: a selected row shows the dark bar on the left. */
    nested?: boolean;
    /** Makes it a link that opens a new tab. A link keeps `id`, `title`, `aria-current` and `className`. */
    href?: string;
  };

/** Splits the kind's props from the ones that go on the element, so none reach the DOM. */
function splitKindProps(
  props: NavRowKindProps & RowDomProps
): [NavRowKindProps, RowDomProps] {
  switch (props.kind) {
    case 'group':
    case 'folder': {
      const { kind, open = false, count, countLabel, ...dom } = props;
      return [
        { kind, open, count, countLabel },
        { ...dom, 'aria-expanded': open },
      ];
    }
    case 'section': {
      const { kind, opens, ...dom } = props;
      return [{ kind, opens }, dom];
    }
    case 'more': {
      const { kind, ...dom } = props;
      return [{ kind }, dom];
    }
    default: {
      const { kind, fmt, unsaved, unsavedLabel, ...dom } = props;
      return [{ kind, fmt, unsaved, unsavedLabel }, dom];
    }
  }
}

/**
 * One row of the navigator or the side nav. A group or folder tells screen readers
 * it is open with `aria-expanded`. Pair `selected` with `aria-current`.
 */
function NavRow({
  children,
  icon,
  selected = false,
  badge,
  unsavedLook,
  nested = false,
  href,
  className,
  type,
  ...rest
}: NavRowProps) {
  const [kindProps, domProps] = splitKindProps(rest);
  const classes = cn(
    navRowVariants({ kind: kindProps.kind ?? 'doc', selected, nested }),
    className
  );
  const content = (
    <NavRowContent
      {...kindProps}
      icon={icon}
      selected={selected}
      badge={badge}
      unsavedLook={unsavedLook}
      external={href !== undefined}
    >
      {children}
    </NavRowContent>
  );

  if (href !== undefined) {
    return (
      <a
        data-slot='nav-row'
        id={domProps.id}
        title={domProps.title}
        aria-current={domProps['aria-current']}
        href={href}
        target='_blank'
        rel='noopener noreferrer'
        className={classes}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      data-slot='nav-row'
      type={type ?? 'button'}
      {...domProps}
      className={classes}
    >
      {content}
    </button>
  );
}

export type { NavRowContentProps, NavRowKind, NavRowProps };
export { NavRow, NavRowContent, navRowVariants };
