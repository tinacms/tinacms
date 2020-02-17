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
  ERROR_MISSING_MDX_PATH,
  ERROR_MISSING_RAW_MDX_BODY,
  ERROR_MISSING_MDX_RAW_FRONTMATTER,
} from './errors'
import { useMemo } from 'react'
import { MdxNode } from './mdx-node'
import { toMdxString } from './to-mdx'
import { generateFields } from './generate-fields'
import * as React from 'react'
const matter = require('gray-matter')

export function useMdxForm(
  _mdx: MdxNode | null | undefined,
  formOverrrides: Partial<FormOptions<any>> = {}
): [MdxNode | null | undefined, Form | null | undefined] {
  const mdx = usePersistentValue(_mdx)

  /**
   * We're returning early here which means all the hooks called by this hook
   * violate the rules of hooks. In the case of the check for
   * `NODE_ENV === 'production'` this should be a non-issue because NODE_ENV
   * will never change at runtime.
   */
  if (!mdx || process.env.NODE_ENV === 'production') {
    return [mdx, null]
  }

  checkMdxExists(mdx)

  /* eslint-disable-next-line react-hooks/rules-of-hooks */
  const cms = useCMS()
  const label = formOverrrides.label || mdx.frontmatter.title
  const id = mdx.fileRelativePath
  const actions = formOverrrides.actions

  /**
   * The state of the MdxForm, generated from the contents of the
   * Markdown file currently on disk. This state will contain any
   * un-committed changes in the Markdown file.
   */
  /* eslint-disable-next-line react-hooks/rules-of-hooks */
  const valuesOnDisk = useMemo(
    () => ({
      fileRelativePath: mdx.fileRelativePath,
      frontmatter: mdx.frontmatter,
      rawMdxBody: mdx.rawMdxBody,
      rawFrontmatter: JSON.parse(mdx.rawFrontmatter),
    }),
    [mdx.rawFrontmatter, mdx.rawMdxBody]
  )

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
      loadInitialValues() {
        return cms.api.git
          .show(id) // Load the contents of this file at HEAD
          .then((git: any) => {
            // Parse the content into the MdxForm data structure and store it in state.
            const { content: rawMdxBody, data: rawFrontmatter } = matter(
              git.content
            )
            return { ...valuesOnDisk, rawFrontmatter, rawMdxBody }
          })
      },
      fields,
      onSubmit(data: any) {
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
      content: toMdxString(formState.values),
    })
  }, [])

  /* eslint-disable-next-line react-hooks/rules-of-hooks */
  useWatchFormValues(form, writeToDisk)

  return [mdx, form]
}

export function useLocalMdxForm(
  mdx: MdxNode | null | undefined,
  formOverrrides: Partial<FormOptions<any>> = {}
): [MdxNode | null | undefined, Form | string | null | undefined] {
  const [values, form] = useMdxForm(mdx, formOverrrides)

  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore form can be `null` and usePlugins doesn't like that.
  usePlugins(form)

  return [values, form]
}

export function useGlobalMdxForm(
  mdx: MdxNode | null | undefined,
  formOverrrides: Partial<FormOptions<any>> = {}
): [MdxNode | null | undefined, Form | string | null | undefined] {
  const [values, form] = useMdxForm(mdx, formOverrrides)

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
 * Throws an error if the Mdx node does not have the
 * fields required for editing.
 */
function checkMdxExists(mdx: MdxNode) {
  if (typeof mdx.fileRelativePath === 'undefined') {
    throw new Error(ERROR_MISSING_MDX_PATH)
  }

  if (typeof mdx.rawFrontmatter === 'undefined') {
    throw new Error(ERROR_MISSING_MDX_RAW_FRONTMATTER)
  }

  if (typeof mdx.rawMdxBody === 'undefined') {
    throw new Error(ERROR_MISSING_RAW_MDX_BODY)
  }
}

function usePersistentValue<T>(nextData: T): T {
  const [data, setData] = React.useState(nextData)

  React.useEffect(() => {
    setData(nextData || data)
  }, [nextData])

  return data
}
