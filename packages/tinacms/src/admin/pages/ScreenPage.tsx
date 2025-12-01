import {
  BillingWarning,
  LocalWarning,
  NavMenuTrigger,
  TinaIcon,
} from '@tinacms/toolkit';
import type { ScreenPlugin, TinaCMS } from '@tinacms/toolkit';
import React from 'react';
import { useParams } from 'react-router-dom';

import GetCMS from '../components/GetCMS';
import { slugify } from '../components/AdminNav';

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
            <div className='py-2 w-full'>
              <BillingWarning />
              <div className='flex items-center gap-4'>
                <NavMenuTrigger className='ml-2' />
                <TinaIcon className='self-center h-10 min-w-10 w-auto text-orange-500' />
                <LocalWarning />
              </div>
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
