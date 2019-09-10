import { FormOptions, Form } from '@tinacms/core'
import { useCMSForm, useCMS } from '@tinacms/react-tinacms'
import {
  ERROR_MISSING_REMARK_PATH,
  ERROR_MISSING_REMARK_RAW_MARKDOWN,
  ERROR_MISSING_REMARK_RAW_FRONTMATTER,
} from './errors'
import { useEffect, useMemo } from 'react'
import { RemarkNode } from './remark-node'
import { toMarkdownString } from './to-markdown'
import { generateFields } from './generate-fields'
import { FormSubscriber } from 'final-form'

let get = require('lodash.get')

export function useRemarkForm(
  markdownRemark: RemarkNode,
  formOverrrides: Partial<FormOptions<any>> = {}
) {
  if (!markdownRemark) {
    return [markdownRemark, null]
  }

  validateMarkdownRemark(markdownRemark)

  let cms = useCMS()
  let name = markdownRemark.fileRelativePath
  let fields = formOverrrides.fields || generateFields(markdownRemark)
  let initialValues = useMemo(
    () => ({
      ...markdownRemark,
      rawFrontmatter: JSON.parse(markdownRemark.rawFrontmatter),
    }),
    [markdownRemark.rawFrontmatter]
  )

  let [values, form] = useCMSForm({
    name,
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
  })

  syncFormWithInitialValues(form, initialValues)

  watchFormValues(form, formState => {
    cms.api.git.onChange!({
      fileRelativePath: formState.values.fileRelativePath,
      content: toMarkdownString(formState.values),
    })
  })

  return [markdownRemark, form]
}

/**
 * Subscribes to value updates from the form with the given callback.
 */
function watchFormValues(form: Form, cb: FormSubscriber<any>) {
  useEffect(() => {
    if (!form) return
    // TODO: Can we _not_ call the callback on-subscribe?
    return form.subscribe(cb, { values: true })
  }, [form])
}

/**
 * Updates the Form with new values from the MarkdownRemark node.
 *
 * Only updates fields that are:
 *
 * 1. registered with the form
 * 2. not currently active
 *
 * It also updates the `markdownRemark.frontmatter` property. This is
 * in-case that field is being used in previewing.
 */
function syncFormWithInitialValues(form: Form, initialValues: any) {
  useEffect(() => {
    if (!form) return
    form.finalForm.batch(() => {
      /**
       * Only update form fields that are observed.
       */
      form.fields.forEach((field: any) => {
        let state = form.finalForm.getFieldState(field.name)
        if (state && !state.active) {
          form.finalForm.change(field.name, get(initialValues, field.name))
        }
      })
      /**
       * Also update frontmatter incase it's being used for previewing.
       */
      form.finalForm.change('frontmatter', initialValues.frontmatter)
    })
  }, [initialValues])
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
