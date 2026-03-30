import React, { PropsWithChildren } from 'react';
import dynamic from 'next/dynamic';
import { unstable_cache } from 'next/cache';
import client from '@/tina/__generated__/client';
import { LayoutProvider } from './layout-context';
import { Header } from './header';

const Footer = dynamic(
  () => import('./footer').then((m) => ({ default: m.Footer })),
  {
    ssr: true,
    loading: () => <div className='h-24' />,
  }
);

type LayoutProps = PropsWithChildren & {
  rawPageData?: Record<string, unknown>;
};

const getGlobalData = unstable_cache(
  async () => {
    const result = await client.queries.global({ relativePath: 'index.json' });
    return result.data?.global || {};
  },
  ['global-settings'],
  { revalidate: 300, tags: ['global'] }
);

const defaultGlobalData = {
  header: {
    name: 'Tina Kitchen Sink',
    color: 'default',
    nav: [
      { href: '/', label: 'Home' },
      { href: '/posts', label: 'Posts' },
      { href: '/blog', label: 'Blog' },
    ],
  },
  footer: {
    social: [],
  },
  theme: {
    color: 'blue',
    font: 'sans',
    darkMode: 'system',
  },
};

export default async function Layout({ children }: LayoutProps) {
  let globalData: Record<string, unknown> = {};

  try {
    globalData = await getGlobalData();
  } catch (e) {
    globalData = defaultGlobalData;
  }

  return (
    <LayoutProvider globalSettings={globalData}>
      <div className='min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-1000'>
        <Header />
        <main className='flex-1 overflow-x-hidden'>{children}</main>
        <Footer />
      </div>
    </LayoutProvider>
  );
}
