import { defineConfig } from 'tinacms';

import Page from './collections/page';
import Post from './collections/post';
import Author from './collections/author';
import Tag from './collections/tag';
import Global from './collections/global';
import Blog from './collections/blog';

// Branch detection for most hosting providers
const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  'main';

export default defineConfig({
  branch,
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID || null,
  token: process.env.TINA_TOKEN || null,
  localContentPath: '../../../shared',
  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },
  media: {
    tina: {
      mediaRoot: 'uploads',
      publicFolder: 'public',
    },
  },
  schema: {
    collections: [Page, Post, Author, Tag, Global, Blog],
  },
});
