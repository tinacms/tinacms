import React from 'react'
import { Components } from './plugins/ui/components'
import { formattingPlugins, commonPlugins } from './plugins/core'
import { helpers } from './plugins/core/common'
import {
  createMdxBlockPlugin,
  createMdxInlinePlugin,
} from './plugins/create-mdx-plugins'
import createImgPlugin from './plugins/create-img-plugin'
import { createInvalidMarkdownPlugin } from './plugins/create-invalid-markdown-plugin'
import { createLinkPlugin } from './plugins/create-link-plugin'
import { uuid } from './plugins/ui/helpers'
import type { RichTextType } from '..'
import { createPlugins, Plate } from '@udecode/plate-common'
import { Editor } from './components/editor'
import { FixedToolbar } from './components/plate-ui/fixed-toolbar'
import { TooltipProvider } from './components/plate-ui/tooltip'
import FixedToolbarButtons from './components/fixed-toolbar-buttons'
import { FloatingToolbar } from './components/plate-ui/floating-toolbar'
import FloatingToolbarButtons from './components/floating-toolbar-buttons'
import { LinkFloatingToolbar } from './components/plate-ui/link-floating-toolbar'
import { isUrl } from './transforms/is-url'
import { ToolbarProvider } from './toolbar/toolbar-provider'

export const RichEditor = (props: RichTextType) => {
  const initialValue = React.useMemo(
    () =>
      props.input.value?.children?.length
        ? props.input.value.children.map(helpers.normalize)
        : [{ type: 'p', children: [{ type: 'text', text: '' }] }],
    []
  )

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
          createLinkPlugin({
            options: {
              //? NOTE: This is a custom validation function that allows for relative links i.e. /about
              isUrl: (url: string) => isUrl(url),
            },
            renderAfterEditable: LinkFloatingToolbar,
          }),
        ],
        {
          components: Components(),
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
    <div ref={ref}>
      <Plate
        id={id}
        initialValue={initialValue}
        plugins={plugins}
        onChange={(value) => {
          props.input.onChange({
            type: 'root',
            children: value,
            embedCode: props.input.value.embedCode,
          })
        }}
      >
        <TooltipProvider>
          <ToolbarProvider
            tinaForm={props.tinaForm}
            templates={props.field.templates}
            overrides={props.field?.toolbarOverride}
          >
            <FixedToolbar>
              <FixedToolbarButtons />
            </FixedToolbar>
            <FloatingToolbar>
              <FloatingToolbarButtons />
            </FloatingToolbar>
          </ToolbarProvider>
          <Editor />
        </TooltipProvider>
      </Plate>
    </div>
  )
}
