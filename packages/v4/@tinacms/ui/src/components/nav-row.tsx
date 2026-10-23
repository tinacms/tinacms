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
      /** A document. */
      kind?: 'doc';
      /** A file type such as `MDX` or `{ }`, shown in place of the icon. */
      fmt?: string;
      /** Shows the amber unsaved dot, or the Unsaved tag with `unsavedLook='badge'`. */
      unsaved?: boolean;
      /** Screen readers hear it for the dot. The tag shows it. */
      unsavedLabel?: string;
    }
  | {
      /** A collection or Globals, or a folder in one. */
      kind: 'group' | 'folder';
      /** The rows under it show. Turns the chevron down. */
      open?: boolean;
      /** The unsaved documents under it, shown from 1. */
      count?: number;
      /** Defaults to "N unsaved". */
      countLabel?: string;
    }
  /** A link to the full table. */
  | { kind: 'more' }
  | {
      /** A side nav entry. */
      kind: 'section';
      /** It opens a panel beside the side nav, so a chevron shows at the end. */
      opens?: boolean;
    };

type NavRowCommonProps = {
  /** Long words end in an ellipsis. Put the full name in `title`. */
  children?: ReactNode;
  /** Groups, folders and documents have one by default. */
  icon?: Glyph | LucideIcon;
  selected?: boolean;
  /** A grey outlined label, such as "FR missing". */
  badge?: string;
  /** `badge` puts unsaved edits in words, so editors can find them again. */
  unsavedLook?: 'dot' | 'badge';
};

type NavRowContentProps = NavRowKindProps &
  NavRowCommonProps & {
    /** The row opens a new tab: the external icon replaces the marks. */
    external?: boolean;
  };

function leadGlyph(props: NavRowKindProps): Glyph | undefined {
  switch (props.kind) {
    case 'folder':
      return props.open ? 'folder-open' : 'folder';
    case 'group':
      return 'collection';
    case undefined:
    case 'doc':
      return props.fmt ? undefined : 'doc';
    default:
      return undefined;
  }
}

/** What sits inside a row, for a control that draws the row's box with `navRowVariants`. */
function NavRowContent({
  children,
  icon,
  selected = false,
  badge,
  unsavedLook = 'dot',
  external = false,
  ...kindProps
}: NavRowContentProps) {
  const glyph =
    kindProps.kind === 'more' ? undefined : (icon ?? leadGlyph(kindProps));
  const lead = glyph ? (
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
  const label = (
    <span data-slot='nav-row-label' className='min-w-0 flex-1 truncate'>
      {children}
      {external ? <span className='sr-only'> (opens in a new tab)</span> : null}
    </span>
  );

  if (external) {
    return (
      <>
        {lead}
        {label}
        <Icon glyph='external' size={14} />
      </>
    );
  }

  const chevron = (
    <span
      className={cn(
        'inline-flex flex-none text-muted-foreground-strong transition-transform',
        kindProps.kind === 'section' && 'ml-auto',
        (kindProps.kind === 'group' || kindProps.kind === 'folder') &&
          kindProps.open &&
          'rotate-90'
      )}
    >
      <Icon glyph='chevron-right' size={14} />
    </span>
  );
  const tag = unsavedLook === 'badge';

  switch (kindProps.kind) {
    case 'group':
    case 'folder': {
      const { count = 0, countLabel = `${count} unsaved` } = kindProps;
      return (
        <>
          {chevron}
          {lead}
          {label}
          {badge ? <Badge kind='label'>{badge}</Badge> : null}
          {count > 0 && tag ? <Badge>{countLabel}</Badge> : null}
          {count > 0 && !tag ? (
            <Badge kind='count' count={count} srLabel={countLabel} />
          ) : null}
        </>
      );
    }
    case 'section':
      return (
        <>
          {lead}
          {label}
          {badge ? <Badge kind='label'>{badge}</Badge> : null}
          {kindProps.opens ? chevron : null}
        </>
      );
    case 'more':
      return (
        <>
          <span aria-hidden='true' className='w-3.5 flex-none' />
          {label}
        </>
      );
    default: {
      const { fmt, unsaved = false, unsavedLabel = 'Unsaved' } = kindProps;
      return (
        <>
          <span aria-hidden='true' className='w-3.5 flex-none' />
          {lead}
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
          {label}
          {badge ? <Badge kind='label'>{badge}</Badge> : null}
          {unsaved && tag ? <Badge>{unsavedLabel}</Badge> : null}
          {unsaved && !tag ? <Badge kind='dot' srLabel={unsavedLabel} /> : null}
        </>
      );
    }
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
  const [kindProps, buttonProps] = splitKindProps(rest);
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
        id={buttonProps.id}
        title={buttonProps.title}
        aria-current={buttonProps['aria-current']}
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
      aria-expanded={
        kindProps.kind === 'group' || kindProps.kind === 'folder'
          ? (kindProps.open ?? false)
          : buttonProps['aria-expanded']
      }
      {...buttonProps}
      className={classes}
    >
      {content}
    </button>
  );
}

/** Splits the kind's props from the ones that go on the element, so none reach the DOM. */
function splitKindProps(
  props: NavRowKindProps & RowDomProps
): [NavRowKindProps, RowDomProps] {
  switch (props.kind) {
    case 'group':
    case 'folder': {
      const { kind, open, count, countLabel, ...dom } = props;
      return [{ kind, open, count, countLabel }, dom];
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

export type { NavRowContentProps, NavRowKind, NavRowProps };
export { NavRow, NavRowContent, navRowVariants };
