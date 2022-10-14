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
import { FieldMeta } from '../../packages/fields'

export const MarkdownFieldPlaceholder = {
  __type: 'field',
  name: 'markdown',
  Component: createPlaceholder(
    'Markdown',
    'https://github.com/tinacms/tinacms/pull/1134'
  ),
}

export const HtmlFieldPlaceholder = {
  __type: 'field',
  name: 'html',
  Component: createPlaceholder(
    'HTML',
    'https://github.com/tinacms/tinacms/pull/1134'
  ),
}

function createPlaceholder(name: string, _pr: string) {
  return (props: any) => {
    return (
      <FieldMeta name={props.input.name} label={`${name} Field not Registered`}>
        <p className="whitespace-normal text-[15px] mt-2">
          The {name} field is not registered. Some built-in field types are not
          bundled by default in an effort to control bundle size. Consult the
          Tina docs to learn how to use this field type.
        </p>
        <p className="whitespace-normal text-[15px] mt-2">
          <a
            className="text-blue-500 underline"
            href="https://tina.io/docs/editing/markdown/#registering-the-field-plugins"
            target="_blank"
            rel="noreferrer noopener"
          >
            Tina Docs: Registering Field Plugins
          </a>
        </p>
      </FieldMeta>
    )
  }
}
