import * as React from 'react'
import { InputProps, BaseTextField } from '../components'
import { wrapFieldsWithMeta } from './wrap-field-with-meta'
import { parse } from './text-format'
import { BiX } from 'react-icons/bi'
import { AddIcon } from '@toolkit/icons'
import { IconButton } from '@toolkit/styles'

export const TagsField = wrapFieldsWithMeta<
  { placeholder: string },
  InputProps
>(({ input, field, form, tinaForm }) => {
  const [value, setValue] = React.useState<string>('')
  const addTag = React.useCallback(
    (tag: string) => {
      if (form.getFieldState(field.name)?.value?.includes(tag)) {
        return
      }
      if (!tag.length) {
        return
      }
      form.mutators.insert(field.name, 0, tag)
      setValue('')
    },
    [form, field.name]
  )
  const items = input.value || []
  const ref = React.useRef(null)
  React.useEffect(() => {
    if (ref.current && field.experimental_focusIntent) {
      ref.current.focus()
    }
  }, [field.experimental_focusIntent, ref])

  return (
    <>
      <div className="flex items-center gap-3">
        <BaseTextField
          ref={ref}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={field.placeholder ? field.placeholder : 'Add a tag'}
          onKeyPress={(event) => {
            if (event.key === ',' || event.key === 'Enter') {
              event.preventDefault()
              addTag(value)
            }
          }}
          className="flex-1"
        />
        <IconButton
          onClick={() => {
            addTag(value)
          }}
          variant="primary"
          size="small"
          className="flex-shrink-0"
        >
          <AddIcon className="w-5/6 h-auto" />
        </IconButton>
      </div>
      <span className="flex gap-2 flex-wrap mt-2 mb-0">
        {items.length === 0 && (
          <span className="text-gray-300 text-sm italic">No tags</span>
        )}
        {items.map((tag: string, index: number) => (
          <Tag key={tag} tinaForm={tinaForm} field={field} index={index}>
            {tag}
          </Tag>
        ))}
      </span>
    </>
  )
})

const Tag = ({ tinaForm, field, index, children, ...styleProps }) => {
  const removeItem = React.useCallback(() => {
    tinaForm.mutators.remove(field.name, index)
  }, [tinaForm, field, index])
  return (
    <span
      className="rounded-full shadow bg-white border border-gray-150 flex items-center tracking-[0.01em] leading-none text-gray-700"
      {...styleProps}
    >
      <span
        style={{ maxHeight: 'calc(var(--tina-sidebar-width) - 50px)' }}
        className="text-sm flex-1 pl-3 pr-1 py-1 truncate"
      >
        {children}
      </span>
      <button
        className="group text-center flex-shrink-0 border-0 bg-transparent pl-1 pr-2 py-1 text-gray-300 hover:text-blue-500 flex items-center justify-center cursor-pointer"
        onClick={removeItem}
      >
        <BiX className="w-4 h-auto transition ease-out duration-100 group-hover:scale-110 origin-center" />
      </button>
    </span>
  )
}

export const TagsFieldPlugin = {
  name: 'tags',
  Component: TagsField,
  parse,
}
