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
import { createPluginFactory } from '@udecode/plate-headless'
import { useEditorContext } from '../../editor-context'
import { buildErrorMessage } from '../../../monaco/error-message'

export const ELEMENT_INVALID_MARKDOWN = 'invalid_markdown'

export const createInvalidMarkdownPlugin = createPluginFactory({
  key: ELEMENT_INVALID_MARKDOWN,
  isVoid: true,
  isInline: false,
  isElement: true,
  component: ({ attributes, element, children }) => {
    return (
      <div {...attributes}>
        <ErrorMessage error={element} />
        {children}
      </div>
    )
  },
})

export function ErrorMessage({ error }) {
  const message = buildErrorMessage(error)
  const { setRawMode } = useEditorContext()
  return (
    <div contentEditable={false} className="bg-red-50 sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-red-800">
          Error parsing markdown
        </h3>
        <div className="mt-2 max-w-xl text-sm text-red-800 space-y-4">
          <p>{message}</p>
          <p>
            To fix these errors, edit your content locally and then restart the
            Tina server.
          </p>
        </div>
        {/* <div className="mt-5">
          <button
            type="button"
            onClick={() => setRawMode(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm"
          >
            Fix Errors
          </button>
        </div> */}
      </div>
    </div>
  )
}
