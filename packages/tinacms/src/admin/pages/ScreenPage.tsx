/**

*/

import React from 'react'
import { useParams } from 'react-router-dom'
import { BillingWarning, LocalWarning } from '@tinacms/toolkit'
import type { TinaCMS, ScreenPlugin } from '@tinacms/toolkit'

import GetCMS from '../components/GetCMS'
import { slugify } from '../components/Sidebar'

const ScreenPage = () => {
  const { screenName } = useParams()

  return (
    <GetCMS>
      {(cms: TinaCMS) => {
        const screens = cms.plugins.getType<ScreenPlugin>('screen').all()
        const selectedScreen = screens.find(
          ({ name }) => slugify(name) === screenName
        )
        return (
          <div className="relative w-full h-full flex flex-col items-stretch justify-between">
            {cms?.api?.tina?.isLocalMode ? (
              <LocalWarning />
            ) : (
              <BillingWarning />
            )}
            <div
              className={`xl:hidden py-5 border-b border-gray-200 bg-white pl-18`}
            >
              {selectedScreen.name}
            </div>
            <div className="flex-1 overflow-y-auto relative flex flex-col items-stretch justify-between">
              <selectedScreen.Component close={() => {}} />
            </div>
          </div>
        )
      }}
    </GetCMS>
  )
}

export default ScreenPage
