/**



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

interface Node {
  id: string
  _internalSys: {
    title: string | null
  }
}
interface OptionSet {
  collection: string
  edges: {
    node: Node
  }[]
}

interface Response {
  collection: {
    documents: {
      edges: {
        node: Node
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
                documents(first: -1) {
                  edges {
                    node {
                      ...on Node {
                        id,
                      }
                      ...on Document {
                        _internalSys: _sys {
                          title
                        }
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
              {edges.map(
                ({
                  node: {
                    id,
                    _internalSys: { title },
                  },
                }) => (
                  <option key={`${id}-option`} value={id}>
                    {title || id}
                  </option>
                )
              )}
            </optgroup>
          ))}
      </select>
      <MdKeyboardArrowDown className="absolute top-1/2 right-3 w-6 h-auto -translate-y-1/2 text-gray-300 group-hover:text-blue-500 transition duration-150 ease-out" />
    </>
  )
}

export default ReferenceSelect
