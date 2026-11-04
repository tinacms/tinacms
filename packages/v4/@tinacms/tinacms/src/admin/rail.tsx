import { NavRow } from '@tinacms/ui/components/nav-row';
import { type Glyph } from '@tinacms/ui/components/icon';
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarSeparator,
} from '@tinacms/ui/components/sidebar';
import { useId } from 'react';
import type { GlobalNavSection, NavTarget } from '../core/slot/contract';
import { useDirtyFormCount } from '../form/form-store';
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
  count?: number;
  onOpen: () => void;
}

function RailEntry({
  label,
  glyph,
  selected,
  opens,
  count = 0,
  onOpen,
}: RailEntryProps) {
  return (
    <SidebarMenuItem>
      <NavRow
        kind='section'
        icon={glyph}
        selected={selected}
        opens={opens}
        count={count}
        aria-label={count > 0 ? `${label}, ${count} unsaved` : label}
        aria-current={selected ? 'page' : undefined}
        className={RAIL_ROW}
        onClick={onOpen}
      >
        {label}
      </NavRow>
    </SidebarMenuItem>
  );
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
  const open = (target: NavTarget) => {
    if (target.kind === 'screen') {
      navigate({ view: 'screen', screen: target.screen, segments: [] });
    } else if (target.kind === 'action') {
      target.run();
    }
  };
  const visible = sections
    .map(({ group, entries }) => ({
      group,
      entries: entries.filter(
        ({ target }) =>
          !(target.kind === 'screen' && target.screen === MEDIA_SCREEN)
      ),
    }))
    .filter(({ entries }) => entries.length > 0);
  const firstUngrouped = visible.findIndex(({ group }) => !group);
  return visible.map(({ group, entries }, index) => {
    const labelId = `${labelPrefix}-${index}`;
    const heading =
      group?.label ?? (index === firstUngrouped ? 'Tools' : undefined);
    return (
      <SidebarGroup key={group ? `group:${group.id}` : `entries:${index}`}>
        {heading ? (
          <SidebarGroupLabel id={labelId}>{heading}</SidebarGroupLabel>
        ) : null}
        <SidebarMenu
          aria-label={
            index === firstUngrouped ? 'Global navigation' : undefined
          }
          aria-labelledby={group ? labelId : undefined}
        >
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
                onClick={() => open(target)}
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
 * The side nav: Home, Collections, Media and Changes, then the entries plugins
 * add. An entry that ends in an arrow opens its panel beside the rail.
 */
export function AdminRail({
  route,
  navigate,
  sections,
  hasMediaScreen,
}: {
  route: AdminRoute;
  navigate: (route: AdminRoute) => void;
  sections: GlobalNavSection[];
  hasMediaScreen: boolean;
}) {
  const changes = useDirtyFormCount();
  const inCollections =
    route.view === 'collections' ||
    route.view === 'collection' ||
    route.view === 'document';
  const onMedia =
    route.view === 'media' ||
    (route.view === 'screen' && route.screen === MEDIA_SCREEN);
  return (
    <>
      <SidebarContent>
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
            <RailEntry
              label='Changes'
              glyph='branch'
              selected={route.view === 'changes'}
              count={changes}
              onOpen={() => navigate({ view: 'changes' })}
            />
          </SidebarMenu>
        </SidebarGroup>

        {sections.length > 0 ? <SidebarSeparator /> : null}

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
