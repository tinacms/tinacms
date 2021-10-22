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

const DashboardPage = () => {
  return (
    <div className="h-screen overflow-y-auto flex flex-col justify-start items-stretch">
      <div className="flex-0 px-6 pt-16 pb-10 w-full flex justify-center bg-white border-b border-gray-150">
        <div className="max-w-screen-md w-full">
          <h3 className="text-4xl">Welcome to Tina CMS.</h3>
        </div>
      </div>
      <div className="w-full px-6 py-10 flex justify-center">
        <div className="max-w-screen-md w-full">
          <p className="text-gray-700 text-lg">
            This is your dashboard for editing or creating content. Select a
            collection on the left to begin.
          </p>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
