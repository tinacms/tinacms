import { defineConfig } from 'tinacms';

import Author from './collections/author';
import Blog from './collections/blog';
import Global from './collections/global';
import Page from './collections/page';
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
    collections: [Author, Blog, Page, Post, Tag, Global],
  },
});
