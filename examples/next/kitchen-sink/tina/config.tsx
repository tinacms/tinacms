import { defineConfig } from 'tinacms';

import Announcement from './collections/announcement';
import Author from './collections/author';
import Blog from './collections/blog';
import Global from './collections/global';
import GlobalEmpty from './collections/global-empty';
import GlobalMulti from './collections/global-multi';
import Page from './collections/page';
import Post from './collections/post';
import SEO from './collections/seo';
import Tag from './collections/tag';

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
    collections: [
      Page,
      Post,
      Author,
      Tag,
      Global,
      Blog,
      SEO,
      Announcement,
      GlobalEmpty,
      GlobalMulti,
    ],
  },
});
