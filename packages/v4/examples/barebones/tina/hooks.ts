import { defineHook, defineHooksPlugin } from '@tinacms/tinacms';

// The form hooks of this project. A collection attaches one with
// `hooks: [trimTitle(), logSave('saved')]`. A hook transforms the document. A
// rule about a field is a field validator (tina/validators.ts).
export const trimTitle = defineHook('trimTitle', () => ({
  beforeSave: (document) => ({
    ...document,
    title: String(document.title ?? '').trim(),
  }),
}));

export const logSave = defineHook('logSave', (prefix: string) => ({
  afterSave: (_document, { path }) => {
    console.info(`${prefix} ${path}`);
  },
}));

export const hooksPlugin = defineHooksPlugin('example:hooks', [
  trimTitle,
  logSave,
]);
