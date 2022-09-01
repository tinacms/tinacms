/**
Copyright 2021 Forestry.io Holdings, Inc.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React from 'react'
import { useParams } from 'react-router-dom'
import { LocalWarning } from '@tinacms/toolkit'
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
            {cms?.api?.tina?.isLocalMode && <LocalWarning />}
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
