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

import * as React from 'react'
import styled from 'styled-components'
import { BiEdit } from 'react-icons/bi'
import { useCMS } from '../../../react-tinacms/use-cms'
import { TinaCMS } from '../../../tina-cms'
import { selectFieldClasses } from './Select'
import { MdKeyboardArrowDown } from 'react-icons/md'

type Option = {
  value: string
  label: string
}

interface ReferenceFieldProps {
  label?: string
  name: string
  component: string
  options: (Option | string)[]
}

export interface ReferenceProps {
  name: string
  input: any
  field: ReferenceFieldProps
  disabled?: boolean
  options?: (Option | string)[]
}

const useGetNode = (cms: TinaCMS, id: string) => {
  const [document, setDocument] = React.useState(undefined)

  React.useEffect(() => {
    const fetchNode = async () => {
      const response = await cms.api.tina.request(
        `
        query($id: String!) {
          node(id:$id) {
            ... on Document {
              sys {
                collection {
                  name
                }
                breadcrumbs
              }
            }
          }
        }`,
        { variables: { id } }
      )

      setDocument(response.node)
    }
    if (cms && id) {
      fetchNode()
    } else {
      setDocument(undefined)
    }
  }, [cms, id])
  return document
}

const GetReference = ({ cms, id, children }) => {
  const document = useGetNode(cms, id)

  if (!document) {
    return null
  }
  return <>{children(document)}</>
}

export const Reference: React.FC<ReferenceProps> = ({
  input,
  field,
  options,
}) => {
  const cms = useCMS()
  const hasTinaAdmin = cms.flags.get('tina-admin') === false ? false : true

  const selectOptions = options || field.options
  return (
    <div>
      <div className="relative group">
        <select
          id={input.name}
          value={input.value}
          onChange={input.onChange}
          className={selectFieldClasses}
          {...input}
        >
          {selectOptions ? (
            selectOptions.map(toProps).map(toComponent)
          ) : (
            <option>{input.value}</option>
          )}
        </select>
        <MdKeyboardArrowDown className="absolute top-1/2 right-3 w-6 h-auto -translate-y-1/2 text-gray-300 group-hover:text-blue-500 transition duration-150 ease-out" />
      </div>
      {hasTinaAdmin && (
        <GetReference cms={cms} id={input.value}>
          {(document) => (
            <a
              href={`/admin#/collections/${
                document.sys.collection.name
              }/${document.sys.breadcrumbs.join('/')}`}
              className="text-gray-700 hover:text-blue-500 flex items-center uppercase text-sm mt-2 mb-2 leading-none"
            >
              <BiEdit className="h-5 w-auto opacity-80 mr-2" />
              Edit in CMS
            </a>
          )}
        </GetReference>
      )}
    </div>
  )
}
function toProps(option: Option | string): Option {
  if (typeof option === 'object') return option
  return { value: option, label: option }
}

function toComponent(option: Option) {
  return (
    <option key={option.value} value={option.value}>
      {option.label}
    </option>
  )
}
