import { FormOptions } from '@tinacms/core'
import { ActionButton } from '@tinacms/tinacms'
import { useCMSForm, useCMS, watchFormValues } from '@tinacms/react-tinacms'
import {
  ERROR_MISSING_REMARK_PATH,
  ERROR_MISSING_REMARK_RAW_MARKDOWN,
  ERROR_MISSING_REMARK_RAW_FRONTMATTER,
} from './errors'
import { useMemo } from 'react'
import { RemarkNode } from './remark-node'
import { toMarkdownString } from './to-markdown'
import { generateFields } from './generate-fields'
import * as React from 'react'

export function useRemarkForm(
  markdownRemark: RemarkNode,
  formOverrrides: Partial<FormOptions<any>> = {}
) {
  if (!markdownRemark) {
    return [markdownRemark, null]
  }

  validateMarkdownRemark(markdownRemark)

  let cms = useCMS()
  let label = markdownRemark.frontmatter.title
  const id = markdownRemark.id
  let initialValues = useMemo(
    () => ({
      ...markdownRemark,
      rawFrontmatter: JSON.parse(markdownRemark.rawFrontmatter),
    }),
    [markdownRemark.rawFrontmatter]
  )
  let fields = formOverrrides.fields || generateFields(initialValues)
  // The `frontmatter` object might be used by fields for previewing.
  // We register it just so we can update keep it up-to-date.
  // @ts-ignore
  fields.push({ name: 'frontmatter', component: null })

  let [values, form] = useCMSForm({
    label,
    id,
    initialValues,
    fields,
    onSubmit(data) {
      return cms.api.git.onSubmit!({
        files: [data.fileRelativePath],
        message: data.__commit_message || 'Tina commit',
        name: data.__commit_name,
        email: data.__commit_email,
      })
    },
    actions: [
      () => (
        <ActionButton
          onClick={async () => {
            if (
              !confirm(
                `Are you sure you want to delete ${markdownRemark.fileRelativePath}?`
              )
            ) {
              return
            }
            // @ts-ignore
            await cms.api.git.onDelete!({
              relPath: markdownRemark.fileRelativePath,
            })

            window.history.back()
          }}
        >
          Delete
        </ActionButton>
      ),
    ],
  })

  watchFormValues(form, formState => {
    cms.api.git.onChange!({
      fileRelativePath: formState.values.fileRelativePath,
      content: toMarkdownString(formState.values),
    })
  })

  return [markdownRemark, form]
}

/**
 * Throws an error if the MarkdownRemark node does not have the
 * fields required for editing.
 */
function validateMarkdownRemark(markdownRemark: RemarkNode) {
  if (typeof markdownRemark.fileRelativePath === 'undefined') {
    throw new Error(ERROR_MISSING_REMARK_PATH)
  }

  if (typeof markdownRemark.rawFrontmatter === 'undefined') {
    throw new Error(ERROR_MISSING_REMARK_RAW_FRONTMATTER)
  }

  if (typeof markdownRemark.rawMarkdownBody === 'undefined') {
    throw new Error(ERROR_MISSING_REMARK_RAW_MARKDOWN)
  }
}
