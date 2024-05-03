import React from 'react'
import { Plate, createPlugins } from '@udecode/plate-headless'
import { components } from './plugins/ui/components'
import { Toolbar, FloatingToolbar, FloatingLink } from './plugins/ui/toolbar'
import { formattingPlugins, commonPlugins } from './plugins/core'
import { helpers } from './plugins/core/common'
import {
  createMdxBlockPlugin,
  createMdxInlinePlugin,
} from './plugins/create-mdx-plugins'
import { createImgPlugin } from './plugins/create-img-plugin'
import { createInvalidMarkdownPlugin } from './plugins/create-invalid-markdown-plugin'
import { createLinkPlugin } from './plugins/create-link-plugin'
import { uuid } from './plugins/ui/helpers'
import { RichTextType } from '..'
import { useRichEditorSave } from '@toolkit/browser-storage/useRichEditorSave'

export const RichEditor = (props: RichTextType) => {
  const [key, setKey] = React.useState(0)
  const { renderInitalValue } = useRichEditorSave(
    props.tinaForm.id,
    props.input.name,
    props.meta.dirty,
    props.input.value,
    props.tinaForm
  )

  console.log(`😅😅😅😅 Render Value: `, renderInitalValue?.[props.input.name])

  const initialValue = React.useMemo(
    () =>
      props.input.value?.children?.length
        ? props.input.value.children.map(helpers.normalize)
        : [{ type: 'p', children: [{ type: 'text', text: '' }] }],
    [props.input.value?.children]
  )

  const newInitialValue = React.useMemo(() => {
    setKey(1)
    return renderInitalValue?.[props.input.name].children.map(helpers.normalize)
  }, [renderInitalValue])

  console.log('Initial Value ::: ', initialValue)

  const plugins = React.useMemo(
    () =>
      createPlugins(
        [
          ...formattingPlugins,
          ...commonPlugins,
          createMdxBlockPlugin(),
          createMdxInlinePlugin(),
          createImgPlugin(),
          createInvalidMarkdownPlugin(),
          createLinkPlugin(),
          // This is a bit buggy
        ],
        {
          components: components(),
        }
      ),
    []
  )

  // This should be a plugin customization
  const withToolbar = true
  const tempId = [props.tinaForm.id, props.input.name].join('.')
  const id = React.useMemo(() => uuid() + tempId, [tempId])
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (ref.current) {
      setTimeout(() => {
        // Slate/Plate doesn't expose it's underlying element
        // as a ref, so we need to query for it ourselves
        const plateElement = ref.current?.querySelector(
          '[role="textbox"]'
        ) as HTMLElement
        if (props.field.experimental_focusIntent && plateElement) {
          if (plateElement) plateElement.focus()
        }
        // Slate takes a second to mount
      }, 100)
    }
  }, [props.field.experimental_focusIntent, ref])

  return (
    <div ref={ref} className={withToolbar ? 'with-toolbar' : ''}>
      <Plate
        id={id}
        key={key}
        initialValue={newInitialValue || initialValue}
        plugins={plugins}
        onChange={(value) => {
          console.log('RichEditor: onChange', value)

          props.input.onChange({
            type: 'root',
            children: value,
          })
        }}
        // Some nodes aren't ready when this runs
        // Fixed in a later release https://github.com/udecode/plate/pull/1689/files
        // normalizeInitialValue={true}
        firstChildren={
          <>
            {withToolbar ? (
              <Toolbar
                tinaForm={props.tinaForm}
                templates={props.field.templates}
                inlineOnly={false}
              />
            ) : (
              <FloatingToolbar
                tinaForm={props.tinaForm}
                templates={props.field.templates}
              />
            )}
            <FloatingLink />
          </>
        }
      ></Plate>
    </div>
  )
}

// export const RichEditor = wrapFieldsWithMeta(RichTextEditor)
