import {
  BillingWarning,
  BranchButton,
  BranchPreviewButton,
  LocalWarning,
  useCMS,
  Nav,
  NavCloudLink,
  useNavData,
} from '@tinacms/toolkit';
import React from 'react';
import { ImFilesEmpty, ImUsers } from 'react-icons/im';
import type { IconType } from 'react-icons/lib';
import { NavLink } from 'react-router-dom';
import { TinaIcon } from '@toolkit/icons';
import { slugify } from '../utils/slugify';

export const PageWrapper = ({
  headerClassName,
  children,
}: {
  headerClassName?: string;
  children: React.ReactNode;
}) => {
  const cms = useCMS();
  const { collectionsInfo, screens, cloudConfigs, isLocalMode } =
    useNavData(cms);

  return (
    <div className='relative left-0 w-full h-full bg-gradient-to-b from-gray-50/50 to-gray-50 overflow-y-auto transition-opacity duration-300 ease-out flex flex-col opacity-100'>
      <div className={`py-2 pr-4 w-full ${headerClassName}`}>
        <BillingWarning />
        <div className='flex items-center gap-4'>
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
          <TinaIcon className='self-center h-10 min-w-10 w-auto text-orange-500' />
          <LocalWarning />
          <BranchButton />
          <BranchPreviewButton />
        </div>
      </div>
      {children}
    </div>
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

export const PageHeader = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className='pt-4 pb-2 px-6'>
      <div className='w-full flex justify-between items-end'>{children}</div>
    </div>
  );
};

export const PageBody = ({ children }: { children: React.ReactNode }) => (
  <div className='py-4 px-6'>{children}</div>
);
