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
