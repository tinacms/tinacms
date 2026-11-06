import { NavRow } from '@tinacms/ui/components/nav-row';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@tinacms/ui/components/tooltip';
import { type Glyph } from '@tinacms/ui/components/icon';
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from '@tinacms/ui/components/sidebar';
import { type KeyboardEvent, type ReactElement, useId } from 'react';
import type {
  GlobalNavEntry,
  GlobalNavSection,
  NavTarget,
} from '../core/slot/contract';
import type { AdminRoute } from './routing';

const DOCS_URL = 'https://tina.io/docs';

// The collapsed rail keeps only the icon. Each row names itself with `aria-label`.
const RAIL_ROW =
  'group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:[&>span:not([data-slot])]:hidden group-data-[collapsible=icon]:[&>[data-slot=nav-row-label]]:hidden';

// The Media manager plugin ships its own entry. The core Media row replaces it.
export const MEDIA_SCREEN = 'media';

interface RailEntryProps {
  label: string;
  glyph: Glyph;
  selected: boolean;
  opens?: boolean;
  onOpen: () => void;
}

function RailEntry({ label, glyph, selected, opens, onOpen }: RailEntryProps) {
  return (
    <SidebarMenuItem>
      <RailTooltip label={label}>
        <NavRow
          kind='section'
          icon={glyph}
          selected={selected}
          opens={opens}
          aria-label={label}
          aria-current={selected ? 'page' : undefined}
          data-rail-row=''
          className={RAIL_ROW}
          onClick={onOpen}
        >
          {label}
        </NavRow>
      </RailTooltip>
    </SidebarMenuItem>
  );
}

// A collapsed rail shows only icons, so each row names itself in a tooltip.
function RailTooltip({
  label,
  children,
}: {
  label: string;
  children: ReactElement;
}) {
  const { state } = useSidebar();
  if (state !== 'collapsed') return children;
  return (
    <Tooltip>
      <TooltipTrigger render={children} />
      <TooltipContent side='right'>{label}</TooltipContent>
    </Tooltip>
  );
}

// Up and Down move between the rail's rows, Home and End jump to the ends.
function moveWithArrows(event: KeyboardEvent<HTMLElement>) {
  const keys = ['ArrowDown', 'ArrowUp', 'Home', 'End'];
  if (!keys.includes(event.key)) return;
  const rows = [
    ...event.currentTarget.querySelectorAll<HTMLElement>(
      '[data-rail-row]:not(:disabled)'
    ),
  ];
  const at = rows.findIndex((row) => row === document.activeElement);
  if (at === -1) return;
  event.preventDefault();
  const next =
    event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? rows.length - 1
        : Math.min(
            Math.max(at + (event.key === 'ArrowDown' ? 1 : -1), 0),
            rows.length - 1
          );
  rows[next]?.focus();
}

const withoutMedia = (entries: GlobalNavEntry[]) =>
  entries.filter(
    ({ target }) =>
      !(target.kind === 'screen' && target.screen === MEDIA_SCREEN)
  );

/** The entries plugins add to the Tools pane: every one that has no group. */
export const toolsEntries = (sections: GlobalNavSection[]): GlobalNavEntry[] =>
  sections.flatMap(({ group, entries }) =>
    group ? [] : withoutMedia(entries)
  );

// A group keeps its own heading in the rail, as the Cloud group does.
const groupedEntries = (sections: GlobalNavSection[]) =>
  sections.flatMap(({ group, entries }) => {
    const visible = withoutMedia(entries);
    return group && visible.length > 0 ? [{ group, entries: visible }] : [];
  });

/** Where a nav entry leads, as one function for the rail and the Tools pane. */
export function openNavTarget(
  target: NavTarget,
  navigate: (route: AdminRoute) => void
) {
  if (target.kind === 'screen') {
    navigate({ view: 'screen', screen: target.screen, segments: [] });
  } else if (target.kind === 'action') {
    target.run();
  }
}

function PluginEntries({
  sections,
  activeScreen,
  navigate,
}: {
  sections: GlobalNavSection[];
  activeScreen?: string;
  navigate: (route: AdminRoute) => void;
}) {
  const labelPrefix = useId();
  const visible = groupedEntries(sections);
  return visible.map(({ group, entries }, index) => {
    const labelId = `${labelPrefix}-${index}`;
    return (
      <SidebarGroup key={group.id}>
        <SidebarGroupLabel id={labelId}>{group.label}</SidebarGroupLabel>
        <SidebarMenu aria-labelledby={labelId}>
          {entries.map(({ label, icon, target }, entryIndex) => (
            <SidebarMenuItem key={`${entryIndex}:${label}`}>
              <NavRow
                kind='section'
                icon={icon}
                external={target.kind === 'url'}
                selected={
                  target.kind === 'screen' && target.screen === activeScreen
                }
                aria-current={
                  target.kind === 'screen' && target.screen === activeScreen
                    ? 'page'
                    : undefined
                }
                aria-label={label}
                data-rail-row=''
                className={RAIL_ROW}
                render={
                  target.kind === 'url' ? (
                    <a
                      href={target.href}
                      target='_blank'
                      rel='noopener noreferrer'
                    />
                  ) : undefined
                }
                onClick={() => openNavTarget(target, navigate)}
              >
                {label}
              </NavRow>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    );
  });
}

/**
 * The side nav: Home, Collections and Media, then Tools and Settings, then the
 * grouped entries plugins add. An entry that ends in an arrow opens its panel beside the rail.
 */
export function AdminRail({
  route,
  navigate,
  sections,
  hasMediaScreen,
  toolsScreenOpen,
}: {
  route: AdminRoute;
  navigate: (route: AdminRoute) => void;
  sections: GlobalNavSection[];
  hasMediaScreen: boolean;
  /** A screen from the Tools pane is open beside it. */
  toolsScreenOpen: boolean;
}) {
  const inCollections =
    route.view === 'collections' ||
    route.view === 'collection' ||
    route.view === 'document';
  const onMedia =
    route.view === 'media' ||
    (route.view === 'screen' && route.screen === MEDIA_SCREEN);
  return (
    <>
      <SidebarContent onKeyDown={moveWithArrows}>
        <SidebarGroup>
          <SidebarMenu aria-label='Navigation'>
            <RailEntry
              label='Home'
              glyph='home'
              selected={route.view === 'home'}
              onOpen={() => navigate({ view: 'home' })}
            />
            <RailEntry
              label='Collections'
              glyph='collection'
              opens
              selected={inCollections}
              onOpen={() => navigate({ view: 'collections' })}
            />
            <RailEntry
              label='Media'
              glyph='media'
              opens
              selected={onMedia}
              onOpen={() =>
                navigate(
                  hasMediaScreen
                    ? { view: 'screen', screen: MEDIA_SCREEN, segments: [] }
                    : { view: 'media' }
                )
              }
            />
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarMenu aria-label='Tools and settings'>
            <RailEntry
              label='Tools'
              glyph='tools'
              opens
              selected={route.view === 'tools' || toolsScreenOpen}
              onOpen={() => navigate({ view: 'tools' })}
            />
            <RailEntry
              label='Settings'
              glyph='settings'
              opens
              selected={route.view === 'settings'}
              onOpen={() => navigate({ view: 'settings' })}
            />
          </SidebarMenu>
        </SidebarGroup>

        <PluginEntries
          sections={sections}
          activeScreen={
            route.view === 'screen' && route.screen !== MEDIA_SCREEN
              ? route.screen
              : undefined
          }
          navigate={navigate}
        />
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <NavRow
              kind='section'
              icon='help'
              external
              aria-label='Help & docs'
              data-rail-row=''
              className={RAIL_ROW}
              render={
                <a href={DOCS_URL} target='_blank' rel='noopener noreferrer' />
              }
            >
              Help &amp; docs
            </NavRow>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
