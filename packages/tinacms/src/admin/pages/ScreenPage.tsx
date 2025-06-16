import { BillingWarning, LocalWarning } from '@tinacms/toolkit';
import type { ScreenPlugin, TinaCMS } from '@tinacms/toolkit';
import React from 'react';
import { useParams } from 'react-router-dom';

import GetCMS from '../components/GetCMS';
import { slugify } from '../components/Sidebar';

const ScreenPage = () => {
  const { screenName } = useParams();

  return (
    <GetCMS>
      {(cms: TinaCMS) => {
        const screens = cms.plugins.getType<ScreenPlugin>('screen').all();
        const selectedScreen = screens.find(
          ({ name }) => slugify(name) === screenName
        );
        return (
          <div className='relative w-full h-full flex flex-col items-stretch justify-between'>
            <div className='pt-2 px-6 bg-white'>
              <LocalWarning />
              <BillingWarning />
            </div>
            <div
              className={`xl:hidden pl-6 py-5 border-b border-gray-200 bg-white`}
            >
              {selectedScreen.name}
            </div>
            <div className='flex-1 overflow-y-auto relative flex flex-col items-stretch justify-between'>
              <selectedScreen.Component close={() => {}} />
            </div>
          </div>
        );
      }}
    </GetCMS>
  );
};

export default ScreenPage;
