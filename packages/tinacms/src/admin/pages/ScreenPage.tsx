/**

*/

import React from 'react'
import { useParams } from 'react-router-dom'
import { BillingWarning, LocalWarning } from '@tinacms/toolkit'
import type { TinaCMS, ScreenPlugin } from '@tinacms/toolkit'

import GetCMS from '../components/GetCMS'
import { slugify } from '../components/Sidebar'
import { useWindowWidth } from '@react-hook/window-size'

const ScreenPage = () => {
  const { screenName } = useParams()

  const navBreakpoint = 1000
  const windowWidth = useWindowWidth()
  const renderNavToggle = windowWidth < navBreakpoint + 1

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
            {renderNavToggle && (
              <div className={`py-5 border-b border-gray-200 bg-white pl-18`}>
                {selectedScreen.name}
              </div>
            )}
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
