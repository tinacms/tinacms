/**

*/

import {
  BillingWarning,
  BranchBanner,
  LocalWarning,
  useCMS,
} from '@tinacms/toolkit';
import React from 'react';

export const PageWrapper = ({ children }: { children: React.ReactNode }) => {
  const cms = useCMS();
  const isLocalMode = cms.api?.tina?.isLocalMode;

  const [branchingEnabled, setBranchingEnabled] = React.useState(() =>
    cms.flags.get('branch-switcher')
  );
  React.useEffect(() => {
    cms.events.subscribe('flag:set', ({ key, value }) => {
      if (key === 'branch-switcher') {
        setBranchingEnabled(value);
      }
    });
  }, [cms.events]);

  return (
    <div className='relative left-0 w-full h-full bg-gradient-to-b from-gray-50/50 to-gray-50 shadow-2xl overflow-y-auto transition-opacity duration-300 ease-out flex flex-col opacity-100'>
      {branchingEnabled && !isLocalMode && <BranchBanner />}
      {children}
    </div>
  );
};

export const PageHeader = ({
  isLocalMode,
  children,
}: {
  isLocalMode?: boolean;
  children: React.ReactNode;
}) => {
  return (
    <>
      <div className='p-4'>
        {isLocalMode && <LocalWarning />}
        {!isLocalMode && <BillingWarning />}
      </div>

      <div className='pt-4 px-6 xl:px-12'>
        <div className='w-full mx-auto max-w-screen-xl'>
          <div className='w-full flex justify-between items-end'>
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

export const PageBody = ({ children }: { children: React.ReactNode }) => (
  <div className='py-8 px-6 xl:px-12'>{children}</div>
);

export const PageBodyNarrow = ({ children }: { children: React.ReactNode }) => (
  <div className='py-10 px-6 xl:px-12'>
    <div className='w-full mx-auto max-w-screen-xl'>{children}</div>
  </div>
);
