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
const matter = require('gray-matter')

export function useRemarkForm(
  markdownRemark: RemarkNode,
  formOverrrides: Partial<FormOptions<any>> = {}
) {
  if (!markdownRemark) {
    return [markdownRemark, null]
  }

  validateMarkdownRemark(markdownRemark)

  const cms = useCMS()
  const label = formOverrrides.label || markdownRemark.frontmatter.title
  const id = markdownRemark.fileRelativePath

  /**
   * The state of the RemarkForm, generated from the contents of the
   * Markdown file currently on disk. This state will contain any
   * un-committed changes in the Markdown file.
   */
  const valuesOnDisk = useMemo(
    () => ({
      ...markdownRemark,
      rawFrontmatter: JSON.parse(markdownRemark.rawFrontmatter),
    }),
    [markdownRemark.rawFrontmatter, markdownRemark.rawMarkdownBody]
  )

  /**
   * The state of the RemarkForm, generated from the contents of the
   * Markdown file at the HEAD of this git branch.
   */
  const [valuesInGit, setValuesInGit] = React.useState()
  React.useEffect(() => {
    cms.api.git
      .show(id) // Load the contents of this file at HEAD
      .then((git: any) => {
        // Parse the content into the RemarkForm data structure and store it in state.
        let { content: rawMarkdownBody, data: rawFrontmatter } = matter(
          git.content
        )
        setValuesInGit({ ...valuesOnDisk, rawFrontmatter, rawMarkdownBody })
      })
      .catch((e: any) => {
        console.log('FAILED', e)
      })
  }, [id])

  /**
   * The list of Field definitions used to generate the form.
   */
  const fields = React.useMemo(() => {
    let fields = formOverrrides.fields || generateFields(valuesOnDisk)
    fields = fields.map(field => {
      /**
       * Treat the field.name prefix `frontmatter` as an alias to
       * `rawFrontmatter`. This is to make defining fields more intuitive.
       */
      if (
        field.name === 'frontmatter' ||
        field.name.startsWith('frontmatter.')
      ) {
        return {
          ...field,
          name: field.name.replace('frontmatter', 'rawFrontmatter'),
        }
      }
      return field
    })

    return fields
  }, [formOverrrides.fields])

  const [values, form] = useCMSForm({
    label,
    id,
    initialValues: valuesInGit,
    currentValues: valuesOnDisk,
    fields,
    onSubmit(data) {
      return cms.api.git.onSubmit!({
        files: [data.fileRelativePath],
        message: data.__commit_message || 'Tina commit',
        name: data.__commit_name,
        email: data.__commit_email,
      })
    },
    reset() {
      return cms.api.git.reset({ files: [id] })
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

  let writeToDisk = React.useCallback(formState => {
    cms.api.git.onChange!({
      fileRelativePath: formState.values.fileRelativePath,
      content: toMarkdownString(formState.values),
    })
  }, [])

  watchFormValues(form, writeToDisk)

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
