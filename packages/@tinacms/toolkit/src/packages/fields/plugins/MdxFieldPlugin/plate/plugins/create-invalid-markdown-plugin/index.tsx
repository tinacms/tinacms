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

export const ELEMENT_INVALID_MARKDOWN = 'invalid_markdown'

export const createInvalidMarkdownPlugin = createPluginFactory({
  key: ELEMENT_INVALID_MARKDOWN,
  isVoid: true,
  isInline: false,
  isElement: true,
  component: ({ attributes, editor, element, children, className }) => {
    return (
      <div
        {...attributes}
        className={`font-mono text-sm bg-green-100 cursor-not-allowed mb-4 ${className}`}
      >
        Invalid markdown, you can fix any errors with the raw editor
        {children}
      </div>
    )
  },
})
