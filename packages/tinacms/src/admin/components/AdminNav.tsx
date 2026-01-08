import React from 'react';
import { ImFilesEmpty, ImUsers } from 'react-icons/im';
import type { IconType } from 'react-icons/lib';
import { NavLink, useLocation } from 'react-router-dom';

import { Nav, NavCloudLink, NavProvider } from '@tinacms/toolkit';
import type { ScreenPlugin, TinaCMS } from '@tinacms/toolkit';

import type { CloudConfigPlugin } from '@tinacms/toolkit';
import { useGetCollections } from './GetCollections';

export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // remove non-word [a-z0-9_], non-whitespace, non-hyphen characters
    .replace(/[\s_-]+/g, '_') // swap any length of whitespace, underscore, hyphen characters with a single _
    .replace(/^-+|-+$/g, ''); // remove leading, trailing -
};

const Sidebar = ({ cms }: { cms: TinaCMS }) => {
  const location = useLocation();
  const collectionsInfo = useGetCollections(cms);
  const screens = cms.plugins.getType<ScreenPlugin>('screen').all();
  const cloudConfigs = cms.plugins
    .getType<CloudConfigPlugin>('cloud-config')
    .all();

  // Open sidebar by default only on the dashboard page (root path)
  const isOnDashboard = location.pathname === '/';

  const isLocalMode = cms.api?.tina?.isLocalMode;
  const activeScreens = screens.filter(
    (screen) =>
      screen.navCategory !== 'Account' ||
      cms.api.tina.authProvider?.getLoginStrategy() === 'UsernamePassword'
  );

  return (
    <Nav
      isLocalMode={isLocalMode}
      showHamburger={false}
      sidebarWidth={360}
      showCollections={true}
      collectionsInfo={collectionsInfo}
      screens={activeScreens}
      cloudConfigs={cloudConfigs}
      contentCreators={[]}
      RenderNavSite={({ view }) => (
        <SidebarLink
          label={view.name}
          to={`/screens/${slugify(view.name)}`}
          Icon={view.Icon ? view.Icon : ImFilesEmpty}
        />
      )}
      RenderNavCloud={({ config }) => <NavCloudLink config={config} />}
      RenderNavCollection={({ collection }) => (
        <SidebarLink
          label={collection.label ? collection.label : collection.name}
          to={`/collections/${collection.name}/~`}
          Icon={ImFilesEmpty}
        />
      )}
      AuthRenderNavCollection={({ collection }) => (
        <SidebarLink
          label={collection.label ? collection.label : collection.name}
          to={`/collections/${collection.name}/~`}
          Icon={ImUsers}
        />
      )}
    />
  );
};

const SidebarLink = (props: {
  to: string;
  label: string;
  Icon: IconType;
  onClick?: any;
}): JSX.Element => {
  const { to, label, Icon } = props;
  return (
    <NavLink
      className={({ isActive }) => {
        return `text-base tracking-wide ${
          isActive ? 'text-blue-600' : 'text-gray-500'
        } hover:text-blue-600 flex items-center opacity-90 hover:opacity-100`;
      }}
      onClick={props.onClick ? props.onClick : () => {}}
      to={to}
    >
      <Icon className='mr-2 h-6 opacity-80 w-auto' /> {label}
    </NavLink>
  );
};

export default Sidebar;
