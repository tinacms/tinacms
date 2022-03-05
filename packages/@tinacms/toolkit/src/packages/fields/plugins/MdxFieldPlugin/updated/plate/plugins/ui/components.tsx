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
import { ELEMENT_BR } from '@udecode/plate-break'
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
import { classNames } from './helpers'
import { useSelected } from 'slate-react'

/**
 * For blocks elements (p, blockquote, ul, ...etc), it
 * can be jarring to see the cursor jump inconsistently
 * based on .prose styles. These classes aim to normalize
 * blocks behavior so they take up the same space
 */
const blockClasses = 'mt-2'
/** prose sets a bold font, making bold marks impossible to see */
const headerClasses = 'font-normal'

export const components = () => {
  return {
    [ELEMENT_H1]: ({ attributes, editor, element, className, ...props }) => (
      <h1
        className={classNames(
          headerClasses,
          blockClasses,
          className,
          'text-4xl font-medium'
        )}
        {...attributes}
        {...props}
      />
    ),
    [ELEMENT_H2]: ({ attributes, editor, element, className, ...props }) => (
      <h2
        className={classNames(
          headerClasses,
          blockClasses,
          className,
          'text-3xl font-medium'
        )}
        {...attributes}
        {...props}
      />
    ),
    [ELEMENT_H3]: ({ attributes, editor, element, className, ...props }) => (
      <h3
        className={classNames(
          headerClasses,
          blockClasses,
          className,
          'text-2xl font-semibold'
        )}
        {...attributes}
        {...props}
      />
    ),
    [ELEMENT_H4]: ({ attributes, editor, element, className, ...props }) => (
      <h4
        className={classNames(
          headerClasses,
          blockClasses,
          className,
          'text-xl font-bold'
        )}
        {...attributes}
        {...props}
      />
    ),
    /** Tailwind prose doesn't style h5 and h6 elements */
    [ELEMENT_H5]: ({ attributes, editor, element, className, ...props }) => (
      <h5
        className={classNames(
          headerClasses,
          blockClasses,
          className,
          'text-lg font-bold'
        )}
        {...attributes}
        {...props}
      />
    ),
    [ELEMENT_H6]: ({ attributes, editor, element, className, ...props }) => (
      <h6
        className={classNames(
          headerClasses,
          blockClasses,
          className,
          'text-base font-bold'
        )}
        {...attributes}
        {...props}
      />
    ),
    [ELEMENT_PARAGRAPH]: ({
      attributes,
      className,
      editor,
      element,
      ...props
    }) => (
      <p
        className={classNames(blockClasses, className, `text-base font-normal`)}
        {...attributes}
        {...props}
      />
    ),
    [ELEMENT_BLOCKQUOTE]: ({
      className,
      attributes,
      editor,
      element,
      ...props
    }) => (
      <blockquote
        className={classNames('not-italic', blockClasses, className)}
        {...attributes}
        {...props}
      />
    ),
    [ELEMENT_CODE_BLOCK]: (props) => <CodeBlock {...props} />,
    [ELEMENT_UL]: ({ attributes, editor, className, element, ...props }) => (
      <ul
        className={classNames(blockClasses, className)}
        {...attributes}
        {...props}
      />
    ),
    [ELEMENT_LI]: ({ attributes, editor, className, element, ...props }) => (
      <li
        className={classNames(blockClasses, className)}
        {...attributes}
        {...props}
      />
    ),
    [ELEMENT_OL]: ({ attributes, editor, className, element, ...props }) => (
      <ol
        className={classNames(blockClasses, className)}
        {...attributes}
        {...props}
      />
    ),
    [ELEMENT_LI]: ({ attributes, className, editor, element, ...props }) => (
      <li
        className={classNames('mt-0 mb-1', className)}
        {...attributes}
        {...props}
      />
    ),
    /** "list item content" */
    [ELEMENT_LIC]: ({ attributes, editor, element, className, ...props }) => (
      <span className={classNames(className)} {...attributes} {...props} />
    ),
    [ELEMENT_LINK]: ({
      attributes,
      editor,
      element,
      nodeProps,
      className,
      ...props
    }) => <a className={classNames(className)} {...attributes} {...props} />,
    [MARK_CODE]: ({ editor, leaf, text, attributes, className, ...props }) => (
      <code
        className={classNames('bg-gray-100 p-1 rounded-sm', className)}
        {...attributes}
        {...props}
      />
    ),
    [MARK_ITALIC]: ({ editor, leaf, text, ...props }) => (
      <em {...props.attributes} {...props} />
    ),
    [MARK_BOLD]: ({ editor, leaf, text, ...props }) => (
      <strong {...props.attributes} {...props} />
    ),
    [ELEMENT_HR]: ({
      attributes,
      className,
      editor,
      element,
      children,
      ...props
    }) => {
      const selected = useSelected()
      return (
        <div
          className={classNames(
            className,
            'cursor-pointer relative border bg-gray-200 my-4'
          )}
          {...attributes}
          {...props}
        >
          {children}
          {selected && (
            <span className="absolute h-4 -top-2 inset-0 ring-2 ring-blue-100 ring-inset rounded-md z-10 pointer-events-none" />
          )}
        </div>
      )
    },
    [ELEMENT_BR]: ({
      attributes,
      className,
      editor,
      element,
      children,
      ...props
    }) => (
      <br
        {...attributes}
        className={className}
        {...props}
      />
    ),
  }
}
