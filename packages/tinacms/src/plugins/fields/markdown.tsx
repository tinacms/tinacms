/**

Copyright 2019 Forestry.io Inc

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
import { FieldMeta } from '@tinacms/fields'

export const MarkdownFieldPlaceholder = {
  __type: 'field',
  name: 'markdown',
  Component: MarkdownPlaceholder,
}

function MarkdownPlaceholder(props: any) {
  return (
    <FieldMeta name={props.input.name} label="Deprecated: Markdown Field">
      <p>
        In order to help improve bundle sizes the Markdown Field has been
        removed from the set of default fields.
      </p>
      <p>
        See the docs to learn how to{' '}
        <a
          // TODO: Add actual link
          href="https://tinacms.org/docs"
          target="_blank"
          rel="noreferrer noopener"
        >
          add the Markdown plugin
        </a>{' '}
        to your CMS.
      </p>
      <p>
        Visit the{' '}
        <a
          href="https://github.com/tinacms/tinacms/pull/1134"
          target="_blank"
          rel="noreferrer noopener"
        >
          Pull Request
        </a>{' '}
        to learn more about why this change was made.
      </p>
    </FieldMeta>
  )
}
