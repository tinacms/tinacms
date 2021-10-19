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
    <div className="h-screen overflow-y-auto flex justify-center items-start">
      <div className="flex-0 px-6 py-14 w-full flex justify-center bg-white border-b border-gray-150">
        <div className="max-w-screen-md w-full">
          <h3 className="text-4xl">Welcome.</h3>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
