'use client';

import type { PlateEditor } from '@udecode/plate/react';
import { SlashInputPlugin } from '@udecode/plate-slash-command/react';

function defaultValueForField(field: any) {
  const type = field?.type;

  if (type === 'string') return field?.ui?.defaultValue ?? '';
  if (type === 'number') return field?.ui?.defaultValue ?? 0;
  if (type === 'boolean') return field?.ui?.defaultValue ?? false;

  if (field?.options?.length) {
    const first = field.options[0];
    return typeof first === 'string' ? first : first?.value ?? '';
  }

  if (type === 'object' && Array.isArray(field?.fields)) {
    const o: Record<string, any> = {};
    for (const f of field.fields) o[f.name] = defaultValueForField(f);
    return o;
  }

  if (type === 'list') return [];

  return field?.ui?.defaultValue ?? '';
}

function buildDefaultProps(template: any) {
  const props: Record<string, any> = {};
  const fields = Array.isArray(template?.fields) ? template.fields : [];
  for (const f of fields) {
    if (!f?.name) continue;
    props[f.name] = defaultValueForField(f);
  }
  return props;
}

export function insertMdxTemplateBlock(editor: PlateEditor, template: any) {
  editor.tf.removeNodes({
    match: (n: any) => n?.type === SlashInputPlugin.key,
  });

  const name = template?.name ?? template?.label;
  if (!name) return;

  const props = buildDefaultProps(template);

  editor.tf.insertNodes({
    type: 'mdxJsxFlowElement',
    name,
    props,
    children: [
      {
        type: 'p',
        children: [{ text: '' }],
      },
    ],
  } as any);

  editor.tf.focus();
}
