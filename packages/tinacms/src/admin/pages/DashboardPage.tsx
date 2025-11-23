import type { TinaCMS } from '@tinacms/toolkit';
import React from 'react';

import GetCMS from '../components/GetCMS';
import { PageBody, PageHeader, PageWrapper } from '../components/Page';

const DashboardPage = () => {
  return (
    <GetCMS>
      {(cms: TinaCMS) => (
        <PageWrapper>
          <>
            <PageHeader>
              <h3 className='text-2xl font-sans text-gray-700'>
                Welcome to Tina!
              </h3>
            </PageHeader>
            <PageBody>
              This is your dashboard for editing or creating content. Select a
              collection on the left to begin.
            </PageBody>
          </>
        </PageWrapper>
      )}
    </GetCMS>
  );
};

export default DashboardPage;
