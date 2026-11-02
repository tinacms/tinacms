import { Plate } from '@udecode/plate/react';
import React from 'react';
import type { RichTextValue } from '../value';
import { Editor, EditorContainer } from './components/editor';
import FixedToolbarButtons from './components/fixed-toolbar-buttons';
import { FixedToolbar } from './components/plate-ui/fixed-toolbar';
import { TooltipProvider } from './components/plate-ui/tooltip';
import type { RichEditorField } from './editor-field';
import { useCreateEditor } from './hooks/use-create-editor';
import { helpers, normalizeLinksInCodeBlocks } from './plugins/core/common';
import { createEditorPlugins } from './plugins/editor-plugins';
import { Components } from './plugins/ui/components';
import { ToolbarProvider } from './toolbar/toolbar-provider';

export interface RichEditorProps {
  input: {
    value: RichTextValue;
    onChange: (value: RichTextValue) => void;
  };
  field: RichEditorField;
  ariaLabelledBy?: string;
  /** Hides the toolbar and stops edits. */
  readOnly?: boolean;
  /** Stops edits and all pointer and keyboard input, toolbar included. */
  disabled?: boolean;
  /** Shown in the first block while it is empty. */
  placeholder?: string;
  /** `framed` stops growing at a fixed height and scrolls; `body` has a minimum height and grows. */
  layout?: 'framed' | 'body';
}

const layoutClass = {
  framed: 'max-h-60',
  body: 'min-h-56',
} as const;

export const RichEditor = ({
  input,
  field,
  ariaLabelledBy,
  readOnly = false,
  disabled = false,
  placeholder,
  layout = 'framed',
}: RichEditorProps) => {
  const [initialValue] = React.useState(() => {
    if (input.value?.children?.length) {
      return helpers.withRootNodeIds(
        input.value.children.map(helpers.normalize)
      );
    }
    return [{ type: 'p', children: [{ type: 'text', text: '' }] }];
  });
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

  return (
    <div inert={disabled || undefined} aria-disabled={disabled || undefined}>
      <Plate
        editor={editor}
        readOnly={readOnly || disabled}
        onChange={(value) => {
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
              overrides={field?.overrides}
            >
              {readOnly ? null : (
                <FixedToolbar>
                  <FixedToolbarButtons />
                </FixedToolbar>
              )}
              <Editor
                aria-labelledby={ariaLabelledBy}
                placeholder={placeholder}
                className={layoutClass[layout]}
              />
            </ToolbarProvider>
          </TooltipProvider>
        </EditorContainer>
      </Plate>
    </div>
  );
};
