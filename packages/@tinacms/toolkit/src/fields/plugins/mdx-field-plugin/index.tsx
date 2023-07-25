import React from 'react'
import { InputProps } from 'react-select/lib/components/Input'
import { InputFieldType, wrapFieldsWithMeta } from '../wrap-field-with-meta'
import { RichEditor } from './plate'
import { EditorContext } from './plate/editor-context'
import type { MdxTemplate } from './plate/types'

// TODO: there's an issue where void node values don't get updated if the editor hasn't been focused from another node first.
// https://github.com/udecode/plate/issues/1519#issuecomment-1184933602

export type RichTextType = React.PropsWithChildren<
  InputFieldType<
    InputProps,
    {
      templates: MdxTemplate[]
    }
  >
>

export const MdxFieldPlugin = {
  name: 'rich-text',
  Component: wrapFieldsWithMeta<InputProps, { templates: MdxTemplate[] }>(
    (props) => {
      const [rawMode, setRawMode] = React.useState(false)
      const [key, setKey] = React.useState(0)

      /**
       * Since slate keeps track of it's own state, and that state is an object rather
       * than something easily memoizable like a string it can be tricky to ensure
       * resets are properly handled. So we sneak in a callback to the form's reset
       * logic that just remounts slate entirely
       */
      React.useMemo(() => {
        const { reset } = props.form
        props.form.reset = (initialValues) => {
          setKey((key) => key + 1)
          return reset(initialValues)
        }
      }, [])

      return (
        <EditorContext.Provider
          key={key}
          value={{
            fieldName: props.field.name,
            templates: props.field.templates,
            rawMode,
            setRawMode,
          }}
        >
          <div
            className={
              'min-h-[100px] max-w-full tina-prose relative shadow-inner focus-within:shadow-outline focus-within:border-blue-500 block w-full bg-white border border-gray-200 text-gray-600 focus-within:text-gray-900 rounded-md px-3 py-2'
            }
          >
            {/* {rawMode ? <RawEditor {...props} /> : <RichEditor {...props} />} */}
            <RichEditor {...props} />
          </div>
        </EditorContext.Provider>
      )
    }
  ),
}

export const MdxFieldPluginExtendible = {
  name: 'rich-text',
  validate(value: any) {
    if (
      typeof value !== 'undefined' &&
      value !== null &&
      Array.isArray(value.children) &&
      value.children[0] &&
      value.children[0].type === 'invalid_markdown'
    ) {
      return 'Unable to parse rich-text'
    } else {
      return undefined
    }
  },
  Component: wrapFieldsWithMeta<InputProps, { templates: MdxTemplate[] }>(
    (props) => {
      const [key, setKey] = React.useState(0)

      /**
       * Since slate keeps track of it's own state, and that state is an object rather
       * than something easily memoizable like a string it can be tricky to ensure
       * resets are properly handled. So we sneak in a callback to the form's reset
       * logic that just remounts slate entirely
       */
      React.useMemo(() => {
        const { reset } = props.form
        props.form.reset = (initialValues) => {
          setKey((key) => key + 1)
          return reset(initialValues)
        }
      }, [])

      return (
        <EditorContext.Provider
          key={key}
          value={{
            fieldName: props.field.name,
            templates: props.field.templates,
            rawMode: props.rawMode,
            setRawMode: props.setRawMode,
          }}
        >
          <div
            className={
              'min-h-[100px] max-w-full tina-prose relative shadow-inner focus-within:shadow-outline focus-within:border-blue-500 block w-full bg-white border border-gray-200 text-gray-600 focus-within:text-gray-900 rounded-md px-3 py-2'
            }
          >
            {props.rawMode ? props.rawEditor : <RichEditor {...props} />}
          </div>
        </EditorContext.Provider>
      )
    }
  ),
}
