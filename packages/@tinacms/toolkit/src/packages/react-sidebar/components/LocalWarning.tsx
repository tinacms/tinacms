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

import * as React from 'react'
import { AiFillWarning } from 'react-icons/ai'

export const LocalWarning = () => {
  return (
    <a
      className="flex w-full text-xs items-center py-1 px-4 text-yellow-600 bg-gradient-to-r from-yellow-50 to-yellow-100 border-b border-yellow-200"
      href="https://tina.io/docs/tina-cloud/"
      target="_blank"
    >
      <AiFillWarning className="w-5 h-auto inline-block mr-1 opacity-70 text-yellow-600" />{' '}
      You are currently in
      <strong className="ml-1 text-yellow-700">Local Mode</strong>
    </a>
  )
}
