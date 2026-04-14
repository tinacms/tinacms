import React, { useState, useEffect, type PropsWithChildren } from 'react';
import client from '@/tina/__generated__/client';
import { LayoutProvider } from './layout-context';
import { Header } from './header';
import { Footer } from './footer';

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

export default function Layout({ children }: PropsWithChildren) {
  const [globalData, setGlobalData] =
    useState<Record<string, unknown>>(defaultGlobalData);

  useEffect(() => {
    client.queries
      .global({ relativePath: 'index.json' })
      .then((result) => {
        if (result.data?.global) {
          setGlobalData(result.data.global as Record<string, unknown>);
        }
      })
      .catch(() => {
        setGlobalData(defaultGlobalData);
      });
  }, []);

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
