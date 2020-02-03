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

import React from 'react'
import { FC } from 'react'
import { NextPage } from 'next'
import { Form } from 'tinacms'
import { MarkdownFile, Options } from './use-markdown-form'
import { useLocalMarkdownForm } from './use-local-markdown-form'

interface MarkdownFormProps {
  markdownFile: MarkdownFile
  fileRelativePath: string
  form: Form
}

/**
 * markdownForm HOC
 */
export function markdownForm(
  Component: FC<MarkdownFormProps>,
  options: Options
): NextPage<MarkdownFormProps> {
  return function MarkdownForm(props: MarkdownFormProps) {
    const { markdownFile } = props
    const [data, form] = useLocalMarkdownForm(markdownFile, options)

    return (
      <Component
        {...props}
        fileRelativePath={props.markdownFile.fileRelativePath}
        markdownFile={data}
        form={form}
      />
    )
  }
}
