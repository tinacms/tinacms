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

import GetCMS from '../components/GetCMS'
import { slugify } from '../components/Sidebar'
import type { TinaCMS, ScreenPlugin } from '@tinacms/toolkit'

const ScreenPage = () => {
  const { screenName } = useParams()
  return (
    <GetCMS>
      {(cms: TinaCMS) => {
        const screens = cms.plugins.getType<ScreenPlugin>('screen').all()
        const selectedScreen = screens.find(
          ({ name }) => slugify(name) === screenName
        )
        console.log('selectedScreen', selectedScreen)
        return (
          <div>
            <selectedScreen.Component close={() => {}} />
          </div>
        )
      }}
    </GetCMS>
  )
}

export default ScreenPage
