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
import { LocalWarning } from '@tinacms/toolkit'

export const PageWrapper = ({
  children,
}: {
  children: React.ReactChild | React.ReactChildren
}) => {
  return (
    <div className="relative left-0 w-full h-full bg-gray-50 shadow-2xl overflow-y-auto transition-opacity duration-300 ease-out flex flex-col opacity-100">
      {children}
    </div>
  )
}

export const PageHeader = ({
  isLocalMode,
  children,
}: {
  isLocalMode?: boolean
  children: React.ReactChild | React.ReactChildren
}) => (
  <>
    {isLocalMode && <LocalWarning />}
    <div className="bg-white pb-4 pt-16 border-b border-gray-200 px-12">
      <div className="w-full mx-auto max-w-screen-xl">
        <div className="w-full flex justify-between items-end">{children}</div>
      </div>
    </div>
  </>
)

export const PageBody = ({
  children,
}: {
  children: React.ReactChild | React.ReactChildren
}) => <div className="py-10 px-12">{children}</div>

export const PageBodyNarrow = ({
  children,
}: {
  children: React.ReactChild | React.ReactChildren
}) => (
  <div className="py-10 px-12">
    <div className="w-full mx-auto max-w-screen-xl">{children}</div>
  </div>
)
