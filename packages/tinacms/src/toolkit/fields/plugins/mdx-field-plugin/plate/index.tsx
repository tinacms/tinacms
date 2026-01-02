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
import { SlashCommandRule } from './components/plate-ui/slash-input-element';
import { MdxTemplate } from './types';
import { TElement } from '@udecode/plate';

type TinaRichTextField = RichTextType['field'] & {
  parser?: { type: string };
  focusIntent?: boolean;
  ui?: {
    templates?: MdxTemplate[];
  };
};

function normalizeTemplates(
  input: MdxTemplate[] | Record<string, MdxTemplate> | undefined
): MdxTemplate[] {
  if (Array.isArray(input)) return input;
  if (input && typeof input === 'object') return Object.values(input);
  return [];
}

export const RichEditor = ({ input, tinaForm, field }: RichTextType) => {
  const tinaField = field as TinaRichTextField;

  const initialValue = React.useMemo(() => {
    const value = input.value as { children?: TElement[] } | undefined;
    if (tinaField.parser?.type === 'slatejson') {
      return value?.children || [];
    } else if (value?.children?.length) {
      return value.children.map(helpers.normalize);
    } else {
      return [{ type: 'p', children: [{ type: 'text', text: '' }] }];
    }
  }, [input.value, tinaField.parser?.type]);

  //TODO try with a wrapper?
  const editor = useCreateEditor({
    plugins: [...editorPlugins],
    value: initialValue,
    components: Components(),
  });

  const templatesRaw = tinaField.templates ?? tinaField.ui?.templates;

  const templates = React.useMemo(
    () => normalizeTemplates(templatesRaw),
    [templatesRaw]
  );

  const slashRules: SlashCommandRule[] = React.useMemo(() => {
    return templates
      .filter((t) => t && (t.name || t.label))
      .map((t) => ({
        value: t.label || t.name,
        onSelect: (ed) => insertMdxTemplateBlock(ed, t),
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
      if (tinaField.focusIntent && plateElement) plateElement.focus();
      // Slate takes a second to mount
    }, 100);
  }, [tinaField.focusIntent]);

  return (
    <div ref={ref}>
      <Plate
        editor={editor}
        onChange={(value) => {
          // Normalize links in code blocks before saving (we dont want type: 'a' inside code blocks, this will break the mdx parser)
          // Ideal Solution: let code block provider to have a option for exclude certain plugins
          const editorValue = value.value as TElement[];
          const normalized = editorValue.map(normalizeLinksInCodeBlocks);

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
                  : field.overrides
              }
              slashRules={slashRules}
            >
              <FixedToolbar>
                <FixedToolbarButtons />
              </FixedToolbar>

              {field.overrides?.showFloatingToolbar !== false ? (
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
