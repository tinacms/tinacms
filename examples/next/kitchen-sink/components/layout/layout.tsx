import React, { PropsWithChildren } from 'react'
import client from '@/tina/__generated__/client'
import { LayoutProvider } from './layout-context'
import { Header } from './header'
import { Footer } from './footer'

type LayoutProps = PropsWithChildren & {
  rawPageData?: any
}

export default async function Layout({ children, rawPageData }: LayoutProps) {
  let globalData: any = {}

  try {
    const result = await client.queries.global({
      relativePath: 'index.json',
    })
    globalData = result.data?.global || {}
  } catch (e) {
    // Fallback to default global settings if fetch fails
    globalData = {
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
    }
  }

  return (
    <LayoutProvider globalSettings={globalData}>
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-1000">
        <Header />
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
        <Footer />
      </div>
    </LayoutProvider>
  )
}
