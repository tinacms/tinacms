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

import {
  FormOptions,
  Form,
  GlobalFormPlugin,
  useCMS,
  useWatchFormValues,
  useForm,
  usePlugins,
} from 'tinacms'
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
  _markdownRemark: RemarkNode | null | undefined,
  formOverrrides: Partial<FormOptions<any>> = {}
): [RemarkNode | null | undefined, Form | null | undefined] {
  const markdownRemark = usePersistentValue(_markdownRemark)

  /**
   * We're returning early here which means all the hooks called by this hook
   * violate the rules of hooks. In the case of the check for
   * `NODE_ENV === 'production'` this should be a non-issue because NODE_ENV
   * will never change at runtime.
   */
  if (!markdownRemark || process.env.NODE_ENV === 'production') {
    return [markdownRemark, null]
  }

  validateMarkdownRemark(markdownRemark)

  /* eslint-disable-next-line react-hooks/rules-of-hooks */
  const cms = useCMS()
  const label = formOverrrides.label || markdownRemark.frontmatter.title
  const id = markdownRemark.fileRelativePath
  const actions = formOverrrides.actions

  /**
   * The state of the RemarkForm, generated from the contents of the
   * Markdown file currently on disk. This state will contain any
   * un-committed changes in the Markdown file.
   */
  /* eslint-disable-next-line react-hooks/rules-of-hooks */
  const valuesOnDisk = useMemo(
    () => ({
      fileRelativePath: markdownRemark.fileRelativePath,
      frontmatter: markdownRemark.frontmatter,
      rawMarkdownBody: markdownRemark.rawMarkdownBody,
      rawFrontmatter: JSON.parse(markdownRemark.rawFrontmatter),
    }),
    [markdownRemark.rawFrontmatter, markdownRemark.rawMarkdownBody]
  )

  /**
   * The state of the RemarkForm, generated from the contents of the
   * Markdown file at the HEAD of this git branch.
   */
  /* eslint-disable-next-line react-hooks/rules-of-hooks */
  const [valuesInGit, setValuesInGit] = React.useState()
  /* eslint-disable-next-line react-hooks/rules-of-hooks */
  React.useEffect(() => {
    cms.api.git
      .show(id) // Load the contents of this file at HEAD
      .then((git: any) => {
        // Parse the content into the RemarkForm data structure and store it in state.
        const { content: rawMarkdownBody, data: rawFrontmatter } = matter(
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
  /* eslint-disable-next-line react-hooks/rules-of-hooks */
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

  /* eslint-disable-next-line react-hooks/rules-of-hooks */
  const [, form] = useForm(
    {
      label,
      id,
      initialValues: valuesInGit,
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
      actions,
    },
    // The Form will be updated if these values change.
    {
      label,
      fields,
      values: valuesOnDisk,
    }
  )

  /* eslint-disable-next-line react-hooks/rules-of-hooks */
  const writeToDisk = React.useCallback(formState => {
    cms.api.git.onChange!({
      fileRelativePath: formState.values.fileRelativePath,
      content: toMarkdownString(formState.values),
    })
  }, [])

  /* eslint-disable-next-line react-hooks/rules-of-hooks */
  useWatchFormValues(form, writeToDisk)

  return [markdownRemark, form]
}

export function useLocalRemarkForm(
  markdownRemark: RemarkNode | null | undefined,
  formOverrrides: Partial<FormOptions<any>> = {}
): [RemarkNode | null | undefined, Form | string | null | undefined] {
  const [values, form] = useRemarkForm(markdownRemark, formOverrrides)

  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore form can be `null` and usePlugins doesn't like that.
  usePlugins(form)

  return [values, form]
}

export function useGlobalRemarkForm(
  markdownRemark: RemarkNode | null | undefined,
  formOverrrides: Partial<FormOptions<any>> = {}
): [RemarkNode | null | undefined, Form | string | null | undefined] {
  const [values, form] = useRemarkForm(markdownRemark, formOverrrides)

  usePlugins(
    React.useMemo(() => {
      if (form) {
        return new GlobalFormPlugin(form, null)
      }
    }, [form])
  )

  return [values, form]
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

function usePersistentValue<T>(nextData: T): T {
  const [data, setData] = React.useState(nextData)

  React.useEffect(() => {
    setData(nextData || data)
  }, [nextData])

  return data
}
