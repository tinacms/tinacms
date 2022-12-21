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

type a = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>
export interface TextAreaProps extends a {
  error?: boolean
  ref?: any
}

export const TextArea = ({ ...props }) => {
  return (
    <textarea
      className="shadow-inner text-base px-3 py-2 text-gray-600 resize-y focus:shadow-outline focus:border-blue-500 block w-full border border-gray-200 focus:text-gray-900 rounded-md"
      {...props}
      style={{ minHeight: '160px' }}
    />
  )
}
