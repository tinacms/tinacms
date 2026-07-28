import { Plate } from '@udecode/plate/react';
import React from 'react';
import type { RichTextValue } from '../rich-text-codec';
import type { RichTextFieldSchema } from '../rich-text-field.schema';
import { Editor, EditorContainer } from './components/editor';
import FixedToolbarButtons from './components/fixed-toolbar-buttons';
import { FixedToolbar } from './components/plate-ui/fixed-toolbar';
import { TooltipProvider } from './components/plate-ui/tooltip';
import { useCreateEditor } from './hooks/use-create-editor';
import { helpers, normalizeLinksInCodeBlocks } from './plugins/core/common';
import { createEditorPlugins } from './plugins/editor-plugins';
import { Components } from './plugins/ui/components';
import { ToolbarProvider } from './toolbar/toolbar-provider';

// The v4 field component (rich-text-field.ui.tsx) reads value/schema through
// address-keyed hooks and hands them here as `input`/`field` — the one seam
// between Plate and v4's form store.
export interface RichEditorProps {
  input: {
    value: RichTextValue;
    onChange: (value: RichTextValue) => void;
  };
  field: RichTextFieldSchema;
  // Goes on the contenteditable itself — a label on the wrapper is invisible to
  // assistive tech, and every other v4 field labels its control.
  ariaLabel?: string;
}

export const RichEditor = ({ input, field, ariaLabel }: RichEditorProps) => {
  // Seeded once: Plate owns the value after mount. Remounting on a document
  // switch is the field component's job (it keys this on the form id).
  const initialValue = React.useMemo(() => {
    if (input.value?.children?.length) {
      return input.value.children.map(helpers.normalize);
    }
    return [{ type: 'p', children: [{ type: 'text', text: '' }] }];
  }, []);
  // Filter out FloatingToolbarPlugin if showFloatingToolbar is false
  const showFloatingToolbar = field?.overrides?.showFloatingToolbar !== false;
  const builtPlugins = React.useMemo(
    () =>
      createEditorPlugins({
        headingLevels: field?.overrides?.headingLevels,
      }),
    [field?.overrides?.headingLevels]
  );
  const plugins = showFloatingToolbar
    ? builtPlugins
    : builtPlugins.filter((plugin) => plugin.key !== 'floating-toolbar');

  const editor = useCreateEditor({
    plugins: [...plugins],
    value: initialValue,
    components: Components(),
  });

  // Focus-on-activation lives in the v4 field component (useFieldActivation),
  // which is why v3's experimental_focusIntent effect is gone from here.
  return (
    <div>
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
              templates={field.templates ?? []}
              overrides={
                field?.toolbarOverride ? field.toolbarOverride : field.overrides
              }
            >
              <FixedToolbar>
                <FixedToolbarButtons />
              </FixedToolbar>
              <Editor aria-label={ariaLabel} />
            </ToolbarProvider>
          </TooltipProvider>
        </EditorContainer>
      </Plate>
    </div>
  );
};
