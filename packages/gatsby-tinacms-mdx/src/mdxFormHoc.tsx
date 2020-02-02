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

import * as React from 'react'
import { FormOptions, Form } from 'tinacms'
import { TinaForm } from '@tinacms/form-builder'
import { useLocalMdx, useGlobalMdx } from './useMdxForm'
import { ERROR_INVALID_QUERY_NAME } from './errors'

interface MdxFormProps extends Partial<FormOptions<any>> {
  queryName?: string // Configure where we are pulling the initial form data from.
}

export function mdx(Component: any, options: MdxFormProps = {}) {
  return function Mdx(props: any) {
    const [mdx] = useLocalMdx(
      getMdx(props.data, options.queryName),
      options
    )

    return <Component {...props} data={{ ...props.data, mdx }} />
  }
}

export function liveMdx(Component: any, options: MdxFormProps = {}) {
  return function Mdx(props: any) {
    const [mdx, form] = useLocalMdx(
      getMdx(props.data, options.queryName),
      options
    )

    return (
      <TinaForm form={form as Form}>
        {editingProps => {
          return (
            <Component
              {...props}
              data={{ ...props.data, mdx }}
              {...editingProps}
              form={form}
            />
          )
        }}
      </TinaForm>
    )
  }
}

export function globalMdx(Component: any, options: MdxFormProps = {}) {
  return function Mdx(props: any) {
    const [mdx] = useGlobalMdx(
      getMdx(props.data, options.queryName),
      options
    )

    return <Component {...props} data={{ ...props.data, mdx }} />
  }
}
const getMdx = (data: any, queryName: string = 'mdx') => {
  const mdx = data[queryName]
  if (!mdx) {
    throw ERROR_INVALID_QUERY_NAME(queryName)
  }
  return mdx
}
