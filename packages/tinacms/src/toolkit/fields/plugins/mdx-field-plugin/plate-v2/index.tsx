import React, { useEffect, useMemo, useRef } from 'react'
import type { RichTextType } from '../..'
import { Plate, PlateContent, createPlugins } from '@udecode/plate-common'
import { helpers } from '../plate/plugins/core/common'
import { components } from '../plate/plugins/ui/components'
import { uuid } from '../plate/plugins/ui/helpers'
import {
  createBoldPlugin,
  createCodePlugin,
  createItalicPlugin,
  createStrikethroughPlugin,
  createUnderlinePlugin,
} from '@udecode/plate-basic-marks'
import { createBlockquotePlugin } from '@udecode/plate-block-quote'
import { createHeadingPlugin } from '@udecode/plate-heading'
import { createParagraphPlugin } from '@udecode/plate-paragraph'
import { FixedToolbar } from './toolbar/fixed-toolbar'
import { FixedToolbarButtons } from './toolbar/fixed-toolbar-buttons'
import { TooltipProvider } from './components/tooltip'
import { cn } from '@udecode/cn'
import { formattingPlugins } from './plugins/formatting'
import { commonPlugins } from './plugins/common'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Editor } from './components/editor'
import { FloatingToolbar } from './components/floating-toolbar'
import { FloatingToolbarButtons } from './components/floating-toolbar-buttons'
import { AllPlugins } from './plugins/core/all'

// import { createPlateUI } from '@/lib/create-plate-ui'

export const RichEditor2 = (props: RichTextType) => {
  const initialValue = useMemo(
    () =>
      props.input.value?.children?.length
        ? props.input.value.children.map(helpers.normalize)
        : [{ type: 'p', children: [{ type: 'text', text: '' }] }],
    [props.input]
  )

  const plugins = useMemo(() => AllPlugins, [])

  // This should be a plugin customization
  const withToolbar = true
  const tempId = [props.tinaForm.id, props.input.name].join('.')
  const id = useMemo(() => uuid() + tempId, [tempId])
  const ref = useRef<HTMLDivElement>(null)
  const containerRef = useRef(null)

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
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
      <TooltipProvider>
        <Plate
          id={id}
          initialValue={initialValue}
          plugins={plugins}
          onChange={(value) => {
            props.input.onChange({
              type: 'root',
              children: value,
            })
          }}
        >
          <FixedToolbar>
            <FixedToolbarButtons />
          </FixedToolbar>

          <Editor />

          <FloatingToolbar>
            <FloatingToolbarButtons />
          </FloatingToolbar>
        </Plate>
      </TooltipProvider>
    </div>
  )
}
