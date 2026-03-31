import { defineConfig } from 'tinacms';

import Author from './collections/author';
import Global from './collections/global';
import Post from './collections/post';
import Tag from './collections/tag';

// Branch detection for most hosting providers
const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  'main';

export default defineConfig({
  branch,
  clientId: process.env.TINA_CLIENT_ID || null,
  token: process.env.TINA_TOKEN || null,
  localContentPath: '../../../shared',
  build: {
    outputFolder: 'admin',
    publicFolder: 'static',
  },
  media: {
    tina: {
      mediaRoot: 'uploads',
      publicFolder: 'static',
    },
  },
  schema: {
    collections: [Author, Post, Tag, Global],
  },
});
