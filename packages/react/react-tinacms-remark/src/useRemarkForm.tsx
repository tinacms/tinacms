import { FormOptions } from '@tinacms/core'
import { useCMSForm, useCMS } from '@tinacms/react-tinacms'
import {
  ERROR_MISSING_CMS_GATSBY,
  ERROR_MISSING_REMARK_ID,
  ERROR_MISSING_REMARK_PATH,
} from './errors'
import { useEffect, useMemo } from 'react'
import { RemarkNode } from './remark-node'
import { toMarkdownString } from './to-markdown'
import { generateFields } from './generate-fields'

let throttle = require('lodash.throttle')

export function useRemarkForm(
  markdownRemark: RemarkNode,
  formOverrrides: Partial<FormOptions<any>> = {},
  timeout: Number = 100
) {
  if (!markdownRemark) {
    return [markdownRemark, null]
  }
  if (typeof markdownRemark.id === 'undefined') {
    throw new Error(ERROR_MISSING_REMARK_ID)
  }
  // TODO: Only required when saving to local filesystem.
  if (typeof markdownRemark.fileRelativePath === 'undefined') {
    throw new Error(ERROR_MISSING_REMARK_PATH)
  }
  try {
    let cms = useCMS()

    let throttledOnChange = useMemo(() => {
      return throttle(cms.api.git.onChange, timeout)
    }, [timeout])

    const initialValues = useMemo(() => {
      let i = {
        ...markdownRemark,
        rawFrontmatter: JSON.parse(markdownRemark.rawFrontmatter),
      }
      return i
    }, [])

    let [values, form] = useCMSForm({
      name: markdownRemark.fileRelativePath,
      initialValues,
      fields: generateFields(markdownRemark),
      onSubmit(data) {
        if (process.env.NODE_ENV === 'development') {
          return cms.api.git.onSubmit!({
            files: [data.fileRelativePath],
            message: data.__commit_message || 'Tina commit',
            name: data.__commit_name,
            email: data.__commit_email,
          })
        } else {
          console.log('Not supported')
        }
      },
      ...formOverrrides,
    })

    /**
     * When using `rawFrontmatter` make sure the `markdownRemark.frontmatter` is kept in sync.
     *
     * TODO: This is a bit hacky.
     */
    useEffect(() => {
      if (!form) return
      form.finalForm.change('frontmatter', markdownRemark.frontmatter)
    }, [markdownRemark.frontmatter])

    useEffect(() => {
      if (!form) return
      return form.subscribe(
        (formState: any) => {
          throttledOnChange({
            fileRelativePath: formState.values.fileRelativePath,
            content: toMarkdownString(formState.values),
          })
        },
        { values: true }
      )
    }, [form])

    return [markdownRemark, form]
  } catch (e) {
    // TODO: this swallows too many errors
    console.log(e)
    throw new Error(ERROR_MISSING_CMS_GATSBY)
  }
}
