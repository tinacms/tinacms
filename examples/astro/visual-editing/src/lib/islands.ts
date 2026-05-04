/**
 * Island registry — single source of truth for every editable region the
 * bridge can refresh. Each entry maps a URL slug under `/tina-island/...`
 * to a fetcher + component + wrapper. Adding a new island = adding one
 * entry to this map; the dynamic [name].ts route picks it up
 * automatically.
 */
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';

import Blocks from '../components/blocks/Blocks.astro';
import AuthorBody from '../components/islands/AuthorBody.astro';
import BlogBody from '../components/islands/BlogBody.astro';
import PostBody from '../components/islands/PostBody.astro';
import Footer from '../components/layout/Footer.astro';
import Header from '../components/layout/Header.astro';
import { getAuthor, getBlog, getGlobal, getPage, getPost } from './data';

export interface IslandConfig {
  /** Resolve the data the component needs. May ignore the search params. */
  fetch: (request: Request, params: URLSearchParams) => Promise<unknown>;
  /** Astro component to render with the fetched data. */
  component: AstroComponentFactory;
  /** Outer element the bridge swaps into — must match the page-side wrapper. */
  wrapper: { tag: string; className?: string };
  /** Map fetched data + URL params to the component's props. */
  propsFromData: (
    data: unknown,
    params: URLSearchParams
  ) => Record<string, unknown>;
}

const ARTICLE_WRAPPER = {
  tag: 'article',
  className: 'max-w-3xl mx-auto px-6 sm:px-8 py-16',
};
const SECTION_WRAPPER = {
  tag: 'section',
  className: 'max-w-3xl mx-auto px-6 sm:px-8 py-16',
};

export const islands: Record<string, IslandConfig> = {
  page: {
    fetch: (request, params) => getPage(params.get('slug') ?? 'home', request),
    component: Blocks,
    wrapper: { tag: 'div' },
    propsFromData: (data) => ({
      blocks:
        (data as { data?: { page?: { blocks?: unknown[] } } }).data?.page
          ?.blocks ?? [],
    }),
  },
  post: {
    fetch: (request, params) => getPost(params.get('slug') ?? '', request),
    component: PostBody,
    wrapper: ARTICLE_WRAPPER,
    propsFromData: (data) => ({
      data: (data as { data?: { post?: unknown } }).data?.post,
    }),
  },
  blog: {
    fetch: (request, params) => getBlog(params.get('filename') ?? '', request),
    component: BlogBody,
    wrapper: ARTICLE_WRAPPER,
    propsFromData: (data) => ({
      data: (data as { data?: { blog?: unknown } }).data?.blog,
    }),
  },
  author: {
    fetch: (request, params) =>
      getAuthor(params.get('filename') ?? '', request),
    component: AuthorBody,
    wrapper: SECTION_WRAPPER,
    propsFromData: (data) => ({
      data: (data as { data?: { author?: unknown } }).data?.author,
    }),
  },
  global: {
    fetch: (request) => getGlobal(request),
    component: Header,
    wrapper: { tag: 'div' },
    propsFromData: (data, params) => ({
      data: (data as { data?: { global?: { header?: unknown } } }).data?.global
        ?.header,
      pathname: params.get('path') ?? '/',
    }),
  },
  'global-footer': {
    fetch: (request) => getGlobal(request),
    component: Footer,
    wrapper: { tag: 'div' },
    propsFromData: (data) => ({
      data: (data as { data?: { global?: { footer?: unknown } } }).data?.global
        ?.footer,
    }),
  },
};
