import { Plate, createPlugins } from '@udecode/plate-common';
import React from 'react';
import type { RichTextType } from '..';
import { Editor } from './components/editor';
import FixedToolbarButtons from './components/fixed-toolbar-buttons';
import FloatingToolbarButtons from './components/floating-toolbar-buttons';
import { FixedToolbar } from './components/plate-ui/fixed-toolbar';
import { FloatingToolbar } from './components/plate-ui/floating-toolbar';
import { LinkFloatingToolbar } from './components/plate-ui/link-floating-toolbar';
import { TooltipProvider } from './components/plate-ui/tooltip';
import { commonPlugins, formattingPlugins } from './plugins/core';
import { helpers } from './plugins/core/common';
import createImgPlugin from './plugins/create-img-plugin';
import { createInvalidMarkdownPlugin } from './plugins/create-invalid-markdown-plugin';
import { createLinkPlugin } from './plugins/create-link-plugin';
import {
  createMdxBlockPlugin,
  createMdxInlinePlugin,
} from './plugins/create-mdx-plugins';
import { createMermaidPlugin } from './plugins/custom/mermaid-plugin';
import { Components } from './plugins/ui/components';
import { uuid } from './plugins/ui/helpers';
import { ToolbarProvider } from './toolbar/toolbar-provider';
import { isUrl } from './transforms/is-url';

export const RichEditor = ({ input, tinaForm, field }: RichTextType) => {
  const initialValue = React.useMemo(
    () =>
      field?.parser?.type === 'slatejson'
        ? input.value.children
        : input.value?.children?.length
          ? input.value.children.map(helpers.normalize)
          : [{ type: 'p', children: [{ type: 'text', text: '' }] }],
    []
  );

  const plugins = React.useMemo(
    () =>
      createPlugins(
        [
          ...formattingPlugins,
          ...commonPlugins,
          createMdxBlockPlugin(),
          createMdxInlinePlugin(),
          createImgPlugin(),
          createMermaidPlugin(),
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
  );

  // This should be a plugin customization
  const tempId = [tinaForm.id, input.name].join('.');
  const id = React.useMemo(() => uuid() + tempId, [tempId]);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (ref.current) {
      setTimeout(() => {
        // Slate/Plate doesn't expose it's underlying element
        // as a ref, so we need to query for it ourselves
        const plateElement = ref.current?.querySelector(
          '[role="textbox"]'
        ) as HTMLElement;
        if (field.experimental_focusIntent && plateElement) {
          if (plateElement) plateElement.focus();
        }
        // Slate takes a second to mount
      }, 100);
    }
  }, [field.experimental_focusIntent, ref]);

  return (
    <div ref={ref}>
      <Plate
        id={id}
        initialValue={initialValue}
        plugins={plugins}
        onChange={(value) => {
          input.onChange({
            type: 'root',
            children: value,
          });
        }}
      >
        <TooltipProvider>
          <ToolbarProvider
            tinaForm={tinaForm}
            templates={field.templates}
            overrides={
              field?.toolbarOverride ? field.toolbarOverride : field.overrides
            }
          >
            <FixedToolbar>
              <FixedToolbarButtons />
            </FixedToolbar>
            {field?.overrides?.showFloatingToolbar !== false ? (
              <FloatingToolbar>
                <FloatingToolbarButtons />
              </FloatingToolbar>
            ) : null}
          </ToolbarProvider>
          <Editor />
        </TooltipProvider>
      </Plate>
    </div>
  );
};
