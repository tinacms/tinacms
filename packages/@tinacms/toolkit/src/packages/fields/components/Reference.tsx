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
  const hasTinaAdmin = cms.flags.get('tina-admin')

  const selectOptions = options || field.options
  return (
    <SelectElement>
      <select
        id={input.name}
        value={input.value}
        onChange={input.onChange}
        {...input}
      >
        {selectOptions ? (
          selectOptions.map(toProps).map(toComponent)
        ) : (
          <option>{input.value}</option>
        )}
      </select>
      {hasTinaAdmin && (
        <GetReference cms={cms} id={input.value}>
          {(document) => (
            <a
              href={`/admin/collections/${
                document.sys.collection.name
              }/${document.sys.breadcrumbs.join('/')}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                textTransform: 'uppercase',
                fontSize: '12px',
                fontWeight: 500,
                marginTop: '8px',
                marginBottom: '4px',
                lineHeight: '1',
              }}
            >
              <BiEdit
                style={{
                  height: '1.365em',
                  width: 'auto',
                  opacity: '0.8',
                  marginRight: '6px',
                }}
              />
              Edit in Tina Admin
            </a>
          )}
        </GetReference>
      )}
    </SelectElement>
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

const SelectElement = styled.div`
  display: block;
  position: relative;

  select {
    all: unset;
    box-sizing: border-box;
    display: block;
    font-family: inherit;
    max-width: 100%;
    color: var(--tina-color-grey-10);
    padding: var(--tina-padding-small);
    border-radius: var(--tina-radius-small);
    background: var(--tina-color-grey-0);
    font-size: var(--tina-font-size-2);
    font-weight: var(--tina-font-weight-regular);
    line-height: 1.35;
    position: relative;
    background-color: var(--tina-color-grey-0);
    transition: all 85ms ease-out;
    border: 1px solid var(--tina-color-grey-2);
    width: 100%;
    margin: 0;
    appearance: none;
    outline: none;
    background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23007CB2%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E');
    background-repeat: no-repeat;
    background-position: right 0.7em top 50%;
    background-size: 0.65em auto;
    padding-right: 1.5rem;
    overflow: hidden;
    text-overflow: ellipsis;

    &:hover {
      box-shadow: 0 0 0 2px var(--tina-color-grey-3);
    }

    &:focus {
      box-shadow: 0 0 0 2px var(--tina-color-primary);
    }
  }

  select:-moz-focusring,
  select::-moz-focus-inner {
    color: transparent;
    text-shadow: 0 0 0 #000;
  }
`
