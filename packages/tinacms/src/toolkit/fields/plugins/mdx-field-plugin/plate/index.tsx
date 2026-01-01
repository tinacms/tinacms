'use client';

import React from 'react';
import { Plate } from '@udecode/plate/react';

import { Components } from './plugins/ui/components';
import { helpers, normalizeLinksInCodeBlocks } from './plugins/core/common';
import type { RichTextType } from '..';

import { Editor, EditorContainer } from './components/editor';
import { FixedToolbar } from './components/plate-ui/fixed-toolbar';
import { TooltipProvider } from './components/plate-ui/tooltip';
import FixedToolbarButtons from './components/fixed-toolbar-buttons';

import { ToolbarProvider } from './toolbar/toolbar-provider';

import { useCreateEditor } from './hooks/use-create-editor';
import { editorPlugins } from './plugins/editor-plugins';

import { FloatingToolbar } from './components/plate-ui/floating-toolbar';
import FloatingToolbarButtons from './components/floating-toolbar-buttons';

import { insertMdxTemplateBlock } from './plugins/core/insert-mdx-template-block';

function normalizeTemplates(input: any): any[] {
  if (Array.isArray(input)) return input;
  if (input && typeof input === 'object') return Object.values(input);
  return [];
}

export const RichEditor = ({ input, tinaForm, field }: RichTextType) => {
  const initialValue = React.useMemo(() => {
    if ((field as any)?.parser?.type === 'slatejson') {
      return (input.value as any).children;
    } else if ((input.value as any)?.children?.length) {
      return (input.value as any).children.map(helpers.normalize);
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

  const templatesRaw =
    (field as any)?.templates ?? (field as any)?.ui?.templates ?? [];

  const templates = React.useMemo(
    () => normalizeTemplates(templatesRaw),
    [templatesRaw]
  );

  const slashRules: SlashCommandRule[] = React.useMemo(() => {
    return templates
      .filter((t: any) => t && (t.name || t.label))
      .map((t: any) => ({
        value: (t.label ?? t.name) as string,
        onSelect: (ed) => insertMdxTemplateBlock(ed as any, t),
      }));
  }, [templates]);

  // This should be a plugin customization
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!ref.current) return;
    setTimeout(() => {
      // Slate/Plate doesn't expose it's underlying element
      // as a ref, so we need to query for it ourselves
      const plateElement = ref.current?.querySelector(
        '[role="textbox"]'
      ) as HTMLElement;
      if ((field as any).focusIntent && plateElement) plateElement.focus();
      // Slate takes a second to mount
    }, 100);
  }, [(field as any).focusIntent, ref]);

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
              templates={templates}
              overrides={
                field?.toolbarOverride
                  ? field.toolbarOverride
                  : (field as any).overrides
              }
              slashRules={slashRules}
            >
              <FixedToolbar>
                <FixedToolbarButtons />
              </FixedToolbar>

              {(field as any)?.overrides?.showFloatingToolbar !== false ? (
                <FloatingToolbar>
                  <FloatingToolbarButtons />
                </FloatingToolbar>
              ) : null}

              <Editor />
            </ToolbarProvider>
          </TooltipProvider>
        </EditorContainer>
      </Plate>
    </div>
  );
};
