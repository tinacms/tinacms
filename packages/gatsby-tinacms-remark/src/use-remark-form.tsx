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

import { FormOptions, Form, GlobalFormPlugin, usePlugins } from 'tinacms'
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
import { useGitForm } from 'gatsby-tinacms-git'
const matter = require('gray-matter')

export function useRemarkForm(
  _node: RemarkNode | null | undefined,
  formOptions: Partial<FormOptions<any>> = {}
): [RemarkNode | null | undefined, Form | null | undefined] {
  const node = usePersistentValue(_node)

  /**
   * We're returning early here which means all the hooks called by this hook
   * violate the rules of hooks.
   */
  if (!node) {
    return [node, null]
  }

  validateMarkdownRemark(node)

  /**
   * The state of the RemarkForm, generated from the contents of the
   * Markdown file currently on disk. This state will contain any
   * un-committed changes in the Markdown file.
   */
  /* eslint-disable-next-line react-hooks/rules-of-hooks */
  const valuesOnDisk = useMemo(
    () => ({
      fileRelativePath: node.fileRelativePath,
      frontmatter: node.frontmatter,
      rawMarkdownBody: node.rawMarkdownBody,
      rawFrontmatter: JSON.parse(node.rawFrontmatter),
    }),
    [node.rawFrontmatter, node.rawMarkdownBody]
  )

  /**
   * The list of Field definitions used to generate the form.
   */
  /* eslint-disable-next-line react-hooks/rules-of-hooks */
  const fields = React.useMemo(() => {
    let fields = formOptions.fields || generateFields(valuesOnDisk)
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
  }, [formOptions.fields])

  const label = formOptions.label || node.frontmatter.title

  const config = {
    ...formOptions,
    label,
    fields,
    format: toMarkdownString,
    parse: (content: string) => ({
      ..._node,
      ...fromMarkdownString(content),
    }),
  }

  /* eslint-disable-next-line react-hooks/rules-of-hooks */
  const [, form] = useGitForm(node, config, {
    label,
    fields,
    values: valuesOnDisk,
  })

  return [node, form]
}

function fromMarkdownString(content: string) {
  const { content: rawMarkdownBody, data: rawFrontmatter } = matter(content)
  return { rawFrontmatter, rawMarkdownBody }
}

/**
 * @deprecated See https://github.com/tinacms/rfcs/blob/master/0006-form-hook-conventions.md
 */
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

/**
 * @deprecated See https://github.com/tinacms/rfcs/blob/master/0006-form-hook-conventions.md
 */
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
