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
import { Sheet, SheetTrigger } from '@toolkit/components/ui/sheet';
import React from 'react';
import { BiMenu } from 'react-icons/bi';
import { ImFilesEmpty, ImUsers } from 'react-icons/im';
import type { IconType } from 'react-icons/lib';
import { NavLink } from 'react-router-dom';
import { TinaIcon } from '@toolkit/icons';
import { slugify } from '../utils/slugify';
import { cn } from '../../utils/cn';

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
          >
            <SheetTrigger asChild>
              <button
                className={cn(
                  'pointer-events-auto p-2 hover:bg-gray-100 transition-colors duration-150 ease-in-out rounded'
                )}
                aria-label='Toggle navigation menu'
              >
                <BiMenu size={24} color='#4B5563' />
              </button>
            </SheetTrigger>
          </Nav>
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
      className={({ isActive }) =>
        isActive
          ? 'px-4 py-2 bg-orange-100 text-orange-500 border-l-4 border-orange-500 -ml-px flex items-center justify-between font-medium text-sm transition-all duration-150 ease-out'
          : 'px-4 py-2 hover:bg-gray-50 text-gray-600 hover:text-orange-500 border-l-4 border-transparent -ml-px flex items-center justify-between font-medium text-sm transition-all duration-150 ease-out'
      }
    >
      <div className='flex items-center gap-3'>
        <span className='opacity-80'>
          <Icon size={20} />
        </span>
        <span>{label}</span>
      </div>
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
