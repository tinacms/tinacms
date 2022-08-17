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
import {
  ELEMENT_HR,
  ELEMENT_LINK,
  ELEMENT_PARAGRAPH,
  ELEMENT_CODE_BLOCK,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_LI,
  ELEMENT_OL,
  ELEMENT_UL,
  ELEMENT_LIC,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
  MARK_CODE,
  MARK_BOLD,
  MARK_ITALIC,
} from '@udecode/plate-headless'
import { CodeBlock } from './code-block'
import { classNames } from './helpers'
import { useSelected } from 'slate-react'

/**
 * For blocks elements (p, blockquote, ul, ...etc), it
 * can be jarring to see the cursor jump inconsistently
 * based on .prose styles. These classes aim to normalize
 * blocks behavior so they take up the same space
 */
const blockClasses = 'mt-0.5'
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
          'text-4xl font-medium mb-4 last:mb-0 mt-6 first:mt-0'
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
          'text-3xl font-medium mb-4 last:mb-0 mt-6 first:mt-0'
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
          'text-2xl font-semibold mb-4 last:mb-0 mt-6 first:mt-0'
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
          'text-xl font-bold mb-4 last:mb-0 mt-6 first:mt-0'
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
          'text-lg font-bold mb-4 last:mb-0 mt-6 first:mt-0'
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
          'text-base font-bold mb-4 last:mb-0 mt-6 first:mt-0'
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
        className={classNames(
          blockClasses,
          className,
          `text-base font-normal mb-4 last:mb-0`
        )}
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
        className={classNames(
          'not-italic mb-4 last:mb-0 border-l-3 border-gray-200 pl-3',
          blockClasses,
          className
        )}
        {...attributes}
        {...props}
      />
    ),
    [ELEMENT_CODE_BLOCK]: (props) => <CodeBlock {...props} />,
    html: ({ attributes, editor, element, children, className }) => {
      return (
        <div
          {...attributes}
          className={classNames(
            'font-mono text-sm bg-green-100 cursor-not-allowed mb-4',
            className
          )}
        >
          {children}
          {element.value}
        </div>
      )
    },
    html_inline: ({ attributes, editor, element, children, className }) => {
      return (
        <span
          {...attributes}
          className={classNames(
            'font-mono bg-green-100 cursor-not-allowed',
            className
          )}
        >
          {children}
          {element.value}
        </span>
      )
    },
    [ELEMENT_UL]: ({ attributes, editor, className, element, ...props }) => (
      <ul
        className={classNames(
          blockClasses,
          className,
          'mb-4 pl-4 list-disc list-inside last:mb-0'
        )}
        {...attributes}
        {...props}
      />
    ),
    [ELEMENT_OL]: ({ attributes, editor, className, element, ...props }) => (
      <ol
        className={classNames(
          blockClasses,
          className,
          'mb-4 pl-2 list-decimal list-inside last:mb-0'
        )}
        {...attributes}
        {...props}
      />
    ),
    [ELEMENT_LI]: ({ attributes, className, editor, element, ...props }) => (
      <li
        className={classNames('p-0 mt-0 mb-0 list-outside', className)}
        {...attributes}
        {...props}
      />
    ),
    /** "list item content" */
    [ELEMENT_LIC]: ({ attributes, editor, element, className, ...props }) => (
      <span
        // without a min-width the cursor is hidden when the list is empty
        className={classNames(className, 'inline-block align-top mb-2')}
        {...attributes}
        {...props}
      />
    ),
    [ELEMENT_LINK]: ({
      attributes,
      editor,
      element,
      nodeProps,
      className,
      ...props
    }) => (
      <a
        className={classNames(
          className,
          'text-blue-500 hover:text-blue-600 transition-color ease-out duration-150 underline'
        )}
        {...attributes}
        {...props}
      />
    ),
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
            'cursor-pointer relative border bg-gray-200 my-4 first:mt-0 last:mb-0'
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
  }
}
