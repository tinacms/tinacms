import { defineHook, defineHooksPlugin } from '@tinacms/tinacms';

// The form hooks of this project. A collection attaches one with
// `hooks: [requireStarsToPublish(), logSave('saved')]`.
export const requireStarsToPublish = defineHook(
  'requireStarsToPublish',
  () => ({
    beforeSave: (document) => {
      if (document.status === 'published' && !document.stars) {
        throw new Error('Rate the post before you publish it');
      }
      return document;
    },
  })
);

export const logSave = defineHook('logSave', (prefix: string) => ({
  afterSave: (_document, { path }) => {
    console.info(`${prefix} ${path}`);
  },
}));

export const hooksPlugin = defineHooksPlugin('example:hooks', [
  requireStarsToPublish,
  logSave,
]);
