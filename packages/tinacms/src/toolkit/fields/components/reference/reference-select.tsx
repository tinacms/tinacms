import * as React from 'react'
import type { TinaCMS } from '@toolkit/tina-cms'
import type { ReferenceFieldProps } from './index'
import { selectFieldClasses } from '../select'
import { LoadingDots } from '@toolkit/form-builder'
import { MdKeyboardArrowDown } from 'react-icons/md'
import { Field } from '@toolkit/forms'
import { Popover, PopoverContent, PopoverTrigger } from './components/popover'
import { Button } from './components/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './components/command'

interface ReferenceSelectProps {
  cms: TinaCMS
  input: any
  field: ReferenceFieldProps & Field
}

interface Node {
  id: string
  _internalSys: {
    filename: string | null
  }
  _values: {
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
      console.log(collections)
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
                          basename
                          breadcrumbs
                          path
                          relativePath
                          extension
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
  const ref = React.useRef(null)
  React.useEffect(() => {
    if (ref.current && field.experimental_focusIntent) {
      ref.current.focus()
    }
  }, [field.experimental_focusIntent, ref])

  if (loading === true) {
    return <LoadingDots color="var(--tina-color-primary)" />
  }

  console.log('cms', cms)
  console.log('input', input)
  console.log('field', field)

  return (
    <>
      <select
        ref={ref}
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
                    _internalSys: { filename },
                    _values: { title },
                  },
                }) => (
                  <option key={`${id}-option`} value={id}>
                    {title || id}
                    <p>{filename}</p>
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

const ComboboxDemo: React.FC<ReferenceSelectProps> = ({
  cms,
  input,
  field,
}) => {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState('')

  const { optionSets, loading } = useGetOptionSets(cms, field.collections)

  React.useEffect(() => {
    // Update form state when the value changes
    input.onChange(value)
  }, [value, input])

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
            className="w-[200px] justify-between"
          >
            <p className="truncate">{value ? value : 'Choose an option...'}</p>
          </Button>
        </PopoverTrigger>
        <PopoverContent className=" p-0 relative">
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
                          _values: { title },
                        },
                      }) => (
                        <CommandItem
                          key={`${id}-option`}
                          value={id}
                          onSelect={(currentValue) => {
                            setValue(currentValue === value ? '' : currentValue)
                            setOpen(false)
                          }}
                        >
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm">
                              {title || id}
                            </span>
                            <span className="text-x">{filename}</span>
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

// export default ReferenceSelect
export default ComboboxDemo
