import React from 'react';
import { Components } from './plugins/ui/components';
import { helpers, normalizeLinksInCodeBlocks } from './plugins/core/common';
import type { RichTextType } from '..';
import { Editor, EditorContainer } from './components/editor';
import { FixedToolbar } from './components/plate-ui/fixed-toolbar';
import { TooltipProvider } from './components/plate-ui/tooltip';
import FixedToolbarButtons from './components/fixed-toolbar-buttons';
import { ToolbarProvider } from './toolbar/toolbar-provider';
import { Plate } from '@udecode/plate/react';
import { useCreateEditor } from './hooks/use-create-editor';
import { editorPlugins } from './plugins/editor-plugins';
import { FloatingToolbar } from './components/plate-ui/floating-toolbar';
import FloatingToolbarButtons from './components/floating-toolbar-buttons';

export const RichEditor = ({ input, tinaForm, field }: RichTextType) => {
  const initialValue = React.useMemo(() => {
    if (field?.parser?.type === 'slatejson') {
      return input.value.children;
    } else if (input.value?.children?.length) {
      const normalized = input.value.children.map(helpers.normalize);
      return normalized;
    } else {
      return [{ type: 'p', children: [{ type: 'text', text: '' }] }];
    }
  }, []);

  //TODO try with a wrapper?
  const editor = useCreateEditor({
    plugins: [...editorPlugins],
    value: initialValue,
    components: Components(),
  });

  // This should be a plugin customization
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (ref.current) {
      setTimeout(() => {
        // Slate/Plate doesn't expose it's underlying element
        // as a ref, so we need to query for it ourselves
        const plateElement = ref.current?.querySelector(
          '[role="textbox"]'
        ) as HTMLElement;
        if (field.focusIntent && plateElement) {
          if (plateElement) plateElement.focus();
        }
        // Slate takes a second to mount
      }, 100);
    }
  }, [field.focusIntent, ref]);
  //
  return (
    <div ref={ref}>
      <Plate
        editor={editor}
        onChange={(value) => {
          // Normalize links in code blocks before saving (we dont want type: 'a' inside code blocks, this will break the mdx parser)
          // Ideal Solution: let code block provider to have a option for exclude certain plugins
          const normalized = (value.value as any[]).map(
            normalizeLinksInCodeBlocks
          );

          input.onChange({
            type: 'root',
            children: normalized,
          });
        }}
      >
        <EditorContainer>
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
        </EditorContainer>
      </Plate>
    </div>
  );
};
