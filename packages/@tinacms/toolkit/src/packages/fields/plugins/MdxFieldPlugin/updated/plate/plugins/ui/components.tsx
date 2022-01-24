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
import { ELEMENT_HR } from '@udecode/plate-horizontal-rule'
import { ELEMENT_LINK } from '@udecode/plate-link'
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph'
import { ELEMENT_CODE_BLOCK } from '@udecode/plate-code-block'
import { ELEMENT_BLOCKQUOTE } from '@udecode/plate-block-quote'
import {
  ELEMENT_LI,
  ELEMENT_OL,
  ELEMENT_UL,
  ELEMENT_LIC,
} from '@udecode/plate-list'
import {
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
} from '@udecode/plate-heading'
import { MARK_CODE, MARK_BOLD, MARK_ITALIC } from '@udecode/plate-basic-marks'
import { CodeBlock } from './code-block'

export const components = () => {
  return {
    [ELEMENT_H1]: ({ attributes, editor, element, ...props }) => (
      <h1 {...attributes} {...props} />
    ),
    [ELEMENT_H2]: ({ attributes, editor, element, ...props }) => (
      <h2 {...attributes} {...props} />
    ),
    [ELEMENT_H3]: ({ attributes, editor, element, ...props }) => (
      <h3 {...attributes} {...props} />
    ),
    [ELEMENT_H4]: ({ attributes, editor, element, ...props }) => (
      <h4 {...attributes} {...props} />
    ),
    [ELEMENT_H5]: ({ attributes, editor, element, ...props }) => (
      <h5 {...attributes} {...props} />
    ),
    [ELEMENT_H6]: ({ attributes, editor, element, ...props }) => (
      <h6 {...attributes} {...props} />
    ),
    [ELEMENT_PARAGRAPH]: ({ attributes, editor, element, ...props }) => (
      <p {...attributes} {...props} />
    ),
    [ELEMENT_BLOCKQUOTE]: ({ attributes, editor, element, ...props }) => (
      <blockquote {...attributes} {...props} />
    ),
    [ELEMENT_CODE_BLOCK]: (props) => <CodeBlock {...props} />,
    [ELEMENT_UL]: ({ attributes, editor, element, ...props }) => (
      <ul {...attributes} {...props} />
    ),
    [ELEMENT_LI]: ({ attributes, editor, element, ...props }) => (
      <li {...attributes} {...props} />
    ),
    [ELEMENT_OL]: ({ attributes, editor, element, ...props }) => (
      <ol {...attributes} {...props} />
    ),
    [ELEMENT_LI]: ({ attributes, editor, element, ...props }) => (
      <li {...attributes} {...props} />
    ),
    /** "list item content" */
    [ELEMENT_LIC]: ({ attributes, editor, element, ...props }) => (
      <span {...attributes} {...props} />
    ),
    [ELEMENT_LINK]: ({ attributes, editor, element, nodeProps, ...props }) => (
      <a {...attributes} {...props} />
    ),
    [MARK_CODE]: ({ editor, leaf, text, ...props }) => (
      <code {...props.attributes} {...props} />
    ),
    [MARK_ITALIC]: ({ editor, leaf, text, ...props }) => (
      <em {...props.attributes} {...props} />
    ),
    [MARK_BOLD]: ({ editor, leaf, text, ...props }) => (
      <strong {...props.attributes} {...props} />
    ),
    [ELEMENT_HR]: ({ attributes, editor, element, ...props }) => (
      <div
        {...attributes}
        {...props}
        className={`${props.className} border bg-gray-200`}
      />
    ),
  }
}
