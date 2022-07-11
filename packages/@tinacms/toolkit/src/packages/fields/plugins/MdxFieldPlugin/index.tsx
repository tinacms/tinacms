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
import { wrapFieldsWithMeta } from '../wrapFieldWithMeta'
import { RawEditor } from './monaco'
import { RichEditor } from './plate'
import { EditorContext } from './plate/editor-context'

export const MdxFieldPlugin = {
  name: 'rich-text',
  Component: wrapFieldsWithMeta((props) => {
    const [rawMode, setRawMode] = React.useState(false)
    return (
      <EditorContext.Provider
        value={{ templates: props.field.templates, rawMode, setRawMode }}
      >
        <div
          className={
            'min-h-[100px] max-w-full tina-prose relative shadow-inner focus-within:shadow-outline focus-within:border-blue-500 block w-full bg-white border border-gray-200 text-gray-600 focus-within:text-gray-900 rounded-md px-3 py-2 mb-5'
          }
        >
          {rawMode ? (
            <div>
              <RawEditor {...props} />
            </div>
          ) : (
            <RichEditor {...props} />
          )}
        </div>
      </EditorContext.Provider>
    )
  }),
}
