import { LoadingDots } from '@toolkit/form-builder'
import { Field } from '@toolkit/forms'
import type { TinaCMS } from '@toolkit/tina-cms'
import * as React from 'react'
import { Button } from './components/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './components/command'
import { Popover, PopoverContent, PopoverTrigger } from './components/popover'
import type { ReferenceFieldProps } from './index'

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
  _internalSys: {
    filename: string
  }
  _values: {
    title: string | null
    name: string | null
  }
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
                        _values
                        _internalSys: _sys {
                          filename
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

// function to get filename from optionSets for display text in combobox
// file name is used for display text because title can be nullable (user can defined name rather than title field)
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
  const [displayText, setDisplayText] = React.useState<string | null>(null) //store display text for selected option
  const { optionSets, loading } = useGetOptionSets(cms, field.collections)

  React.useEffect(() => {
    setDisplayText(getFilename(optionSets, value))
    input.onChange(value)
  }, [value, input, optionSets])

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
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 relative">
          <Command>
            <CommandInput placeholder="Search reference..." />
            <CommandEmpty>No reference found</CommandEmpty>
            {optionSets.length > 0 &&
              optionSets.map(({ collection, edges }: OptionSet) => (
                <CommandGroup key={`${collection}-group`} heading={collection}>
                  <CommandList>
                    {edges.map(
                      ({
                        node: {
                          id,
                          _internalSys: { filename },
                          _values: { title, name },
                        },
                      }) => (
                        <CommandItem
                          key={`${id}-option`}
                          value={id}
                          onSelect={() => {
                            setValue(id)
                            setOpen(false)
                          }}
                        >
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm">
                              {title || name || id}
                            </span>
                            {(title || name) && (
                              <span className="text-x">{filename}</span>
                            )}
                          </div>
                        </CommandItem>
                      )
                    )}
                  </CommandList>
                </CommandGroup>
              ))}
          </Command>
        </PopoverContent>
      </Popover>
    </>
  )
}

export default ComboboxDemo
