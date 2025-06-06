/**

*/

import {
  BillingWarning,
  BranchBanner,
  BranchButton,
  BranchPreviewButton,
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
  const cms = useCMS();
  const branchingEnabled = cms.flags.get('branch-switcher');
  return (
    <>
      <div className='py-2 px-4'>
        {isLocalMode && <LocalWarning />}
        {!isLocalMode && <BillingWarning />}
        {branchingEnabled && !isLocalMode && (
          <div className='flex justify-between items-center'>
            <BranchButton />
            <BranchPreviewButton />
          </div>
        )}
      </div>

      <div className='pt-4 pb-2 px-6'>
        <div className='w-full flex justify-between items-end'>{children}</div>
      </div>
    </>
  );
};

export const PageBody = ({ children }: { children: React.ReactNode }) => (
  <div className='py-4 px-6'>{children}</div>
);
