import { LoadingDots } from '@toolkit/form-builder'
import type { Field } from '@toolkit/forms'
import type { TinaCMS } from '@toolkit/tina-cms'
import * as React from 'react'
import { IoMdArrowDropdown, IoMdArrowDropup } from 'react-icons/io'
import { Button } from './components/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
} from './components/command'
import OptionComponent from './components/option-component'
import { Popover, PopoverContent, PopoverTrigger } from './components/popover'
import type {
  InternalSys,
  ReferenceFieldProps,
} from './model/reference-field-props'
import {
  CollectionFilters,
  filterQueryBuilder,
} from './utils/fetch-options-query-builder'
interface ReferenceSelectProps {
  cms: TinaCMS
  input: any
  field: ReferenceFieldProps & Field
}

type Edge = {
  node: Node
}

interface Node {
  id: string
  _internalSys: InternalSys
  //Using uknown type as _values can be any type from the collection user degined in schema
  _values: unknown
}
interface OptionSet {
  collection: string
  edges: Edge[]
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

const useGetOptionSets = (
  cms: TinaCMS,
  collections: string[],
  collectionFilter?: CollectionFilters | undefined // Record of filters, keyed by collection
) => {
  const [optionSets, setOptionSets] = React.useState<OptionSet[]>([])
  const [loading, setLoading] = React.useState(true)
  React.useEffect(() => {
    const fetchOptionSets = async () => {
      const filters =
        typeof collectionFilter === 'function'
          ? collectionFilter()
          : collectionFilter

      const optionSets = await Promise.all(
        collections.map(async (collection) => {
          try {
            const filter = filters?.[collection]
              ? filterQueryBuilder(filters[collection], collection)
              : {}

            const response: Response = await cms.api.tina.request(
              `#graphql
            query ($collection: String!, $filter: DocumentFilter) {
              collection(collection: $collection) {
                documents(first: -1, filter: $filter) {
                  edges {
                    node {
                      ...on Node {
                        id,
                      }
                      ...on Document {
                        _values
                        _internalSys: _sys {
                          filename
                          path
                        }
                      }
                    }
                  }
                }
              }
            }
            `,
              {
                variables: {
                  collection,
                  filter,
                },
              }
            )

            return {
              collection,
              edges: response.collection.documents.edges,
            }
          } catch (e) {
            console.error(
              'Exception thrown while building and running GraphQL query: ',
              e
            )

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

// function to get the filename from optionSets to display text in the combobox
// file name is used to display text as the title can be nullable (user can define the name rather than title field)
//? Note - This is looking for a field with `name` or `title`
const getFilename = (optionSets: OptionSet[], value: string): string | null => {
  // Flatten the optionSets array to a single array of nodes
  const nodes = optionSets.flatMap((optionSet) =>
    optionSet.edges.map((edge) => edge.node)
  )
  const node = nodes.find((node) => node.id === value)

  return node ? node._internalSys.filename : null
}

const ComboboxDemo: React.FC<ReferenceSelectProps> = ({
  cms,
  input,
  field,
}) => {
  const [open, setOpen] = React.useState<boolean>(false)
  const [value, setValue] = React.useState<string | null>(input.value)
  //Store display text for selected option
  const [displayText, setDisplayText] = React.useState<string | null>(null)
  const { optionSets, loading } = useGetOptionSets(
    cms,
    field.collections,
    field.collectionFilter
  )
  const [filteredOptionsList, setFilteredOptionsList] =
    React.useState<OptionSet[]>(optionSets)

  React.useEffect(() => {
    setDisplayText(getFilename(optionSets, value))
    input.onChange(value)
  }, [value, input, optionSets])

  // Assign list of options to filteredOptionsList when list of options is fetched/updated
  React.useEffect(() => {
    if (field.experimental___filter && optionSets.length > 0) {
      setFilteredOptionsList(field.experimental___filter(optionSets, undefined))
    } else {
      setFilteredOptionsList(optionSets)
    }
  }, [optionSets, field.experimental___filter])

  if (loading === true) {
    return <LoadingDots color="var(--tina-color-primary)" />
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-52 justify-between"
          >
            <p className="truncate">{displayText ?? 'Choose an option...'}</p>
            {open ? (
              <IoMdArrowDropup size={20} />
            ) : (
              <IoMdArrowDropdown size={20} />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 relative">
          <Command
            shouldFilter={!field.experimental___filter}
            filter={(value, search) => {
              if (value.toLowerCase().includes(search.toLowerCase())) return 1
              return 0
            }}
          >
            <CommandInput
              placeholder="Search reference..."
              onValueChange={(search) => {
                if (field.experimental___filter) {
                  setFilteredOptionsList(
                    field.experimental___filter(optionSets, search)
                  )
                }
              }}
            />
            <CommandEmpty>No reference found</CommandEmpty>
            <CommandList>
              {filteredOptionsList.length > 0 &&
                filteredOptionsList?.map(({ collection, edges }: OptionSet) => (
                  <CommandGroup
                    key={`${collection}-group`}
                    heading={collection}
                  >
                    <CommandList>
                      {edges?.map(({ node }) => {
                        const { id, _values } = node
                        return (
                          <OptionComponent
                            id={id}
                            key={id}
                            value={value}
                            field={field}
                            _values={_values}
                            node={node}
                            onSelect={(currentValue) => {
                              setValue(currentValue)
                              setOpen(false)
                            }}
                          />
                        )
                      })}
                    </CommandList>
                  </CommandGroup>
                ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </>
  )
}

export default ComboboxDemo
