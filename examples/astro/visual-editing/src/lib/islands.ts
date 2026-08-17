/**
 * Island registry — single source of truth for every editable region the
 * bridge can refresh. Each entry maps a URL slug under `/tina-island/...`
 * to a fetcher + component + wrapper. Adding a new island = adding one
 * entry to this map; the dynamic [name].ts route picks it up
 * automatically.
 */
import type { IslandRegistry } from '@tinacms/astro/experimental';

import Blocks from '../components/blocks/Blocks.astro';
import AuthorBody from '../components/islands/AuthorBody.astro';
import BlogBody from '../components/islands/BlogBody.astro';
import PostBody from '../components/islands/PostBody.astro';
import Footer from '../components/layout/Footer.astro';
import Header from '../components/layout/Header.astro';
import { getAuthor, getBlog, getGlobal, getPage, getPost } from './data';

const ARTICLE_WRAPPER = {
  tag: 'article',
  className: 'max-w-3xl mx-auto px-6 sm:px-8 py-16',
};
const SECTION_WRAPPER = {
  tag: 'section',
  className: 'max-w-3xl mx-auto px-6 sm:px-8 py-16',
};

export const islands: IslandRegistry = {
  page: {
    fetch: (_request, params) => getPage(params.get('slug') ?? 'home'),
    component: Blocks,
    wrapper: { tag: 'div' },
    propsFromData: (data) => ({
      page: (data as { data?: { page?: unknown } }).data?.page,
    }),
  },
  post: {
    fetch: (_request, params) => getPost(params.get('slug') ?? ''),
    component: PostBody,
    wrapper: ARTICLE_WRAPPER,
    propsFromData: (data) => ({
      data: (data as { data?: { post?: unknown } }).data?.post,
    }),
  },
  blog: {
    fetch: (_request, params) => getBlog(params.get('filename') ?? ''),
    component: BlogBody,
    wrapper: ARTICLE_WRAPPER,
    propsFromData: (data) => ({
      data: (data as { data?: { blog?: unknown } }).data?.blog,
    }),
  },
  author: {
    fetch: (_request, params) => getAuthor(params.get('filename') ?? ''),
    component: AuthorBody,
    wrapper: SECTION_WRAPPER,
    propsFromData: (data) => ({
      data: (data as { data?: { author?: unknown } }).data?.author,
    }),
  },
  global: {
    fetch: () => getGlobal(),
    component: Header,
    wrapper: { tag: 'div' },
    propsFromData: (data, params) => ({
      data: (data as { data?: { global?: { header?: unknown } } }).data?.global
        ?.header,
      pathname: params.get('path') ?? '/',
    }),
  },
  'global-footer': {
    fetch: () => getGlobal(),
    component: Footer,
    wrapper: { tag: 'div' },
    propsFromData: (data) => ({
      data: (data as { data?: { global?: { footer?: unknown } } }).data?.global
        ?.footer,
    }),
  },
};
