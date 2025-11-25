import React from 'react';
import { ImFilesEmpty, ImUsers } from 'react-icons/im';
import type { IconType } from 'react-icons/lib';
import { NavLink } from 'react-router-dom';

import { Nav, type TinaCMS, NavCloudLink, useNavData } from '@tinacms/toolkit';
import { slugify } from '../utils/slugify';

interface AdminNavProps {
  cms: TinaCMS;
}

export const AdminNav = ({ cms }: AdminNavProps) => {
  const { collectionsInfo, screens, cloudConfigs, isLocalMode } =
    useNavData(cms);

  return (
    <Nav
      isLocalMode={isLocalMode}
      sidebarWidth={360}
      showCollections={true}
      collectionsInfo={collectionsInfo}
      screens={screens}
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
