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
import type { TinaCMS } from '../../../../tina-cms'
import type { ReferenceFieldProps } from './index'
import { selectFieldClasses } from '../Select'
import { LoadingDots } from '../../../form-builder'
import { MdKeyboardArrowDown } from 'react-icons/md'

interface ReferenceSelectProps {
  cms: TinaCMS
  input: any
  field: ReferenceFieldProps
}

interface OptionSet {
  collection: string
  edges: {
    node: { id: string }
  }[]
}

interface Response {
  collection: {
    documents: {
      edges: {
        node: {
          id: string
        }
      }[]
    }
  }
}

const useGetOptionSets = (cms: TinaCMS, collections: string[]) => {
  const [optionSets, setOptionSets] = React.useState<OptionSet[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchOptionSets = async () => {
      const optionSets = await Promise.all(
        collections.map(async (collection) => {
          try {
            const response: Response = await cms.api.tina.request(
              `#graphql
            query ($collection: String!){
              collection(collection: $collection) {
                documents {
                  edges {
                    node {
                      ...on Node {
                        id
                      }
                    }
                  }
                }
              }
            }
            `,
              { variables: { collection } }
            )

            return {
              collection,
              edges: response.collection.documents.edges,
            }
          } catch (e) {
            return {
              collection,
              edges: [],
            }
          }
        })
      )

      setOptionSets(optionSets)
      setLoading(false)
    }

    if (cms && collections.length > 0) {
      fetchOptionSets()
    } else {
      setOptionSets([])
    }
  }, [cms, collections])

  return { optionSets, loading }
}

const ReferenceSelect: React.FC<ReferenceSelectProps> = ({
  cms,
  input,
  field,
}) => {
  const { optionSets, loading } = useGetOptionSets(cms, field.collections)

  if (loading === true) {
    return <LoadingDots color="var(--tina-color-primary)" />
  }

  return (
    <>
      <select
        id={input.name}
        value={input.value}
        onChange={input.onChange}
        className={selectFieldClasses}
        {...input}
      >
        <option value={''}>Choose an option</option>
        {optionSets.length > 0 &&
          optionSets.map(({ collection, edges }: OptionSet) => (
            <optgroup key={`${collection}-group`} label={collection}>
              {edges.map(({ node: { id } }) => (
                <option key={`${id}-option`} value={id}>
                  {id}
                </option>
              ))}
            </optgroup>
          ))}
      </select>
      <MdKeyboardArrowDown className="absolute top-1/2 right-3 w-6 h-auto -translate-y-1/2 text-gray-300 group-hover:text-blue-500 transition duration-150 ease-out" />
    </>
  )
}

export default ReferenceSelect
