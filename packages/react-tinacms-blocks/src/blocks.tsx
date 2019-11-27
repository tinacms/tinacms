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
import { BlockTemplate as DefaultBlockTemplate } from 'tinacms'

export interface BlockTemplate extends DefaultBlockTemplate {
  Component: any
}

export interface BlocksProps {
  name: string
  data: any[]
  templates: {
    [key: string]: BlockTemplate
  }
}

export function Blocks({ name, data = [], templates = {} }: BlocksProps) {
  return (
    <>
      {data.map((data, index) => {
        const template = templates[data._template]

        if (!template) {
          return nullOrError('Unrecognized Block Type: ' + data._template)
        }

        if (!template.Component) {
          return nullOrError(
            `The "${template.label}" block template is missing the Component`
          )
        }

        return <template.Component data={data} index={index} name={name} />
      })}
    </>
  )
}

const nullOrError = (message: string) => {
  if (process.env.NODE_ENV === 'development') {
    throw new Error(message)
  }

  return null
}
