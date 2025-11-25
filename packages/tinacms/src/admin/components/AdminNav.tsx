import { Nav, NavCloudLink, useCMS, useNavData } from '@tinacms/toolkit';
import React from 'react';
import { ImFilesEmpty, ImUsers } from 'react-icons/im';
import type { IconType } from 'react-icons/lib';
import { NavLink } from 'react-router-dom';
import { slugify } from '../utils/slugify';

interface AdminNavProps {
  defaultOpen?: boolean;
  sidebarWidth?: number;
}

export const AdminNav = ({
  defaultOpen = false,
  sidebarWidth = 360,
}: AdminNavProps) => {
  const cms = useCMS();
  const { collectionsInfo, screens, cloudConfigs, isLocalMode } =
    useNavData(cms);

  return (
    <Nav
      isLocalMode={isLocalMode}
      sidebarWidth={sidebarWidth}
      showCollections={true}
      collectionsInfo={collectionsInfo}
      screens={screens}
      defaultOpen={defaultOpen}
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
}): JSX.Element => {
  const { to, label, Icon } = props;
  return (
    <NavLink
      to={to}
      end
      className='text-base tracking-wide text-gray-500 hover:text-blue-600 flex items-center opacity-90 hover:opacity-100'
    >
      <span className='mr-2 opacity-80'>
        <Icon size={24} />
      </span>{' '}
      {label}
    </NavLink>
  );
};
