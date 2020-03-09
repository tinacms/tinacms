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
import { Form } from 'tinacms'

export interface BlocksProps {
  form: Form
  name: string
  data: any[]
  components: {
    [key: string]: any // Todo: React Component
  }
}

export function Blocks({ form, name, data, components }: BlocksProps) {
  data = data || []
  components = components || {}

  return (
    <>
      {data.map((data, index) => {
        const Component = components[data._template]

        if (!Component) {
          return nullOrError('Unrecognized Block Type: ' + data._template)
        }

        return (
          <Component
            // NOTE: Supressing warnings, but not helping with render perf
            key={index}
            form={form}
            data={data}
            index={index}
            name={name}
          />
        )
      })}
    </>
  )
}

/**
 * Conditionally return `null` or throw an Error depending on NODE_ENV.o
 *
 * Useful if you want to provide the developer with some information
 * while they are developing, but then fail silently in production.
 */
const nullOrError = (message: string) => {
  if (process.env.NODE_ENV === 'development') {
    throw new Error(message)
  }

  return null
}
