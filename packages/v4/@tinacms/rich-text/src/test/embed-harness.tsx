import { render } from '@testing-library/react';
import type { Value } from '@udecode/plate';
import { Plate, PlateContent, usePlateEditor } from '@udecode/plate/react';
import React from 'react';
import { type Mock, vi } from 'vitest';
import {
  EditorContext,
  type EditorContextValue,
} from '../plate/editor-context';
import {
  ELEMENT_MDX_BLOCK,
  ELEMENT_MDX_INLINE,
  createMdxBlockPlugin,
  createMdxInlinePlugin,
} from '../plate/plugins/create-mdx-plugins';
import type { MdxTemplate } from '../plate/types';

export const FIELD_NAME = 'body';

export const ctaTemplate: MdxTemplate = {
  key: 'cta',
  name: 'Cta',
  label: 'Call to action',
  inline: true,
  fields: [
    { name: 'heading', label: 'Heading', type: 'string', isTitle: true },
  ],
};

export const bannerTemplate: MdxTemplate = {
  key: 'banner',
  name: 'Banner',
  label: 'Banner',
  fields: [{ name: 'heading', label: 'Heading', type: 'string' }],
};

export const inlineValue: Value = [
  {
    type: 'p',
    children: [
      { text: 'before ' },
      {
        type: ELEMENT_MDX_INLINE,
        name: 'Cta',
        props: { heading: 'Sign up' },
        children: [{ text: '' }],
      },
      { text: ' after' },
    ],
  },
];

export const blockValue: Value = [
  { type: 'p', children: [{ text: 'before' }] },
  {
    type: ELEMENT_MDX_BLOCK,
    name: 'Banner',
    props: { heading: 'Hello' },
    children: [{ text: '' }],
  },
  { type: 'p', children: [{ text: 'after' }] },
];

type HarnessEditor = ReturnType<typeof usePlateEditor>;

interface HarnessProps {
  value: Value;
  templates: MdxTemplate[];
  onActivateField: (address: string) => void;
  onEditorReady: (editor: HarnessEditor) => void;
}

const Harness = ({
  value,
  templates,
  onActivateField,
  onEditorReady,
}: HarnessProps) => {
  const editor = usePlateEditor({
    plugins: [createMdxInlinePlugin, createMdxBlockPlugin],
    value,
  });

  onEditorReady(editor);

  const context: EditorContextValue = {
    fieldName: FIELD_NAME,
    templates,
    rawMode: false,
    setRawMode: () => {},
    onActivateField,
    embedEditAvailable: false,
  };

  return (
    <EditorContext.Provider value={context}>
      <Plate editor={editor}>
        <PlateContent />
      </Plate>
    </EditorContext.Provider>
  );
};

/**
 * Slate reads the live DOM selection, so the editor must be in the document
 * body. Testing Library mounts there by default — a detached container makes
 * every selection assertion vacuously true.
 */
export const renderEmbedEditor = ({
  value,
  templates,
}: {
  value: Value;
  templates: MdxTemplate[];
}): { editor: HarnessEditor; onActivateField: Mock } => {
  const onActivateField = vi.fn();
  let editor: HarnessEditor | undefined;

  render(
    <Harness
      value={value}
      templates={templates}
      onActivateField={onActivateField}
      onEditorReady={(next) => {
        editor = next;
      }}
    />
  );

  if (!editor) {
    throw new Error('harness did not expose an editor');
  }

  return { editor, onActivateField };
};
