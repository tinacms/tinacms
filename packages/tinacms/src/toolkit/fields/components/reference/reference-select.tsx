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
  filterQueryBuilder,
  CollectionFilters,
  mockFilters,
} from './utils/fetch-optioins'
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

//TODO: Filter can be nullable
const useGetOptionSets = (
  cms: TinaCMS,
  collections: string[],
  filters?: CollectionFilters | undefined // Record of filters, keyed by collection
) => {
  const [optionSets, setOptionSets] = React.useState<OptionSet[]>([])
  const [loading, setLoading] = React.useState(true)
  console.log('collections', collections)
  React.useEffect(() => {
    const fetchOptionSets = async () => {
      const optionSets = await Promise.all(
        collections.map(async (collection) => {
          try {
            const filter = filters
              ? filterQueryBuilder(filters[collection], collection)
              : {}
            console.log('filter', filter)
            // filter: {  author: { name: { eq: "Napolean" }}}
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
  console.log('new optionSets', optionSets)

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
    mockFilters
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
              //Replace / in the file path with empty string to make it searchable
              if (
                value
                  .toLowerCase()
                  .replace(/\//g, '')
                  .includes(search.toLowerCase())
              )
                return 1
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
