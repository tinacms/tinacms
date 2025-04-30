import React from 'react';
import { Components } from './plugins/ui/components';
import { formattingPlugins, commonPlugins } from './plugins/core';
import { helpers } from './plugins/core/common';
import {
  createMdxBlockPlugin,
  createMdxInlinePlugin,
} from './plugins/create-mdx-plugins';
import createImgPlugin from './plugins/create-img-plugin';
import { createInvalidMarkdownPlugin } from './plugins/create-invalid-markdown-plugin';
import { uuid } from './plugins/ui/helpers';
import type { RichTextType } from '..';
import { Editor } from './components/editor';
import { FixedToolbar } from './components/plate-ui/fixed-toolbar';
import { TooltipProvider } from './components/plate-ui/tooltip';
import FixedToolbarButtons from './components/fixed-toolbar-buttons';
import { FloatingToolbar } from './components/plate-ui/floating-toolbar';
import FloatingToolbarButtons from './components/floating-toolbar-buttons';
import { LinkFloatingToolbar } from './components/plate-ui/link-floating-toolbar';
import { isUrl } from './transforms/is-url';
import { ToolbarProvider } from './toolbar/toolbar-provider';
import { createMermaidPlugin } from './plugins/custom/mermaid-plugin';
import { Plate, usePlateEditor } from '@udecode/plate/react';
import { LinkPlugin } from '@udecode/plate-link/react';

export const RichEditor = ({ input, tinaForm, field }: RichTextType) => {
  const initialValue = React.useMemo(
    () =>
      input.value?.children?.length
        ? input.value.children.map(helpers.normalize)
        : [{ type: 'p', children: [{ type: 'text', text: '' }] }],
    []
  );

  const plugins = [
    ...formattingPlugins,
    ...commonPlugins,
    //TODO(Plate Upgrade) : Enable these plugins, they are temporary disable due to plate upgrade (giving some error, we need to deal with it later before plate upgrade can be released)
    // createMdxBlockPlugin(),
    // createMdxInlinePlugin(),
    // createImgPlugin(),
    // createMermaidPlugin(),
    // createInvalidMarkdownPlugin(),
    LinkPlugin.configure({
      options: {
        // Custom validation function to allow relative links, e.g., /about
        isUrl: (url) => isUrl(url),
      },
      render: { afterEditable: () => <LinkFloatingToolbar /> },
    })
  ];

  // This should be a plugin customization
  const tempId = [tinaForm.id, input.name].join('.');
  const id = React.useMemo(() => uuid() + tempId, [tempId]);
  const ref = React.useRef<HTMLDivElement>(null);

  const editor = usePlateEditor({
    id: id,
    value: initialValue,
    plugins: plugins,
    override: {
      components: Components(),
    },
  });

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
        editor={editor}
        onChange={(value) => {

          console.log("changes 🎯",value.value)
          input.onChange({
            type: 'root',
            //TODO(Plate upgrade) : Check with Jeff, value.value is used because the new Plate seperate the editor instance and causing the editor to passed as well int he value change, so value.value is a quick work around to extract the value of the editor (if not we will have error down the track to the final form, circular dependency error)
            children: value.value, 
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
              //TODO(Plate Upgrade) : Are we actually using this?
              // <FloatingToolbar>
              //   <FloatingToolbarButtons />
              // </FloatingToolbar>
              <></>
            ) : null}
          </ToolbarProvider>
          <Editor />
        </TooltipProvider>
      </Plate>
    </div>
  );
};
