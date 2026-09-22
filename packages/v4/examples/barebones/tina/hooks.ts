import { type HookRef, definePlugin } from '@tinacms/tinacms';
import { type JsonValue, defineClientPlugin } from '@tinacms/tinacms/client';

// The form hooks of this project. A collection attaches one with
// `hooks: [requireStarsToPublish(), logSave('saved')]`.
export const requireStarsToPublish = (): HookRef => ({
  name: 'requireStarsToPublish',
});

export const logSave = (prefix: string): HookRef => ({
  name: 'logSave',
  args: [prefix],
});

export const hooksPlugin = definePlugin({
  name: 'example:hooks',
  provides: ['hooks'],
  hooks: ['requireStarsToPublish', 'logSave'],
  client: async () => ({
    default: defineClientPlugin({
      hooks: {
        requireStarsToPublish: () => ({
          beforeSave: (document) => {
            if (document.status === 'published' && !document.stars) {
              throw new Error('Rate the post before you publish it');
            }
            return document;
          },
        }),
        logSave: (prefix: JsonValue) => ({
          afterSave: (_document, { path }) => {
            console.info(`${String(prefix)} ${path}`);
          },
        }),
      },
    }),
  }),
});
