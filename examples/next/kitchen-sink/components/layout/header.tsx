'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLayout } from './layout-context'
import { Container } from './container'
import { Icon } from './icon'
import { headerColorClasses, activeItemClasses, activeBackgroundClasses } from '@/lib/utils'

export const Header = () => {
  const { globalSettings, theme } = useLayout()
  const pathname = usePathname()

  const header = globalSettings?.header
  const nav = header?.nav || []

  const headerColorCss =
    header?.color === 'primary'
      ? headerColorClasses[theme.color] || headerColorClasses.blue
      : headerColorClasses.default

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname?.startsWith(href)
  }

  return (
    <header className={`relative overflow-hidden bg-gradient-to-b ${headerColorCss}`}>
      <Container size="custom" className="py-0 relative z-10">
        <div className="flex items-center justify-between gap-6">
          <h4 className="select-none text-lg font-bold tracking-tight my-4 transition duration-150 ease-out transform">
            <Link
              href="/"
              className="flex items-center gap-1 whitespace-nowrap tracking-[.002em]"
            >
              <Icon
                parentColor={header?.color || 'default'}
                data={{
                  name: 'Tina',
                  color: header?.color === 'primary' ? 'primary' : theme.color,
                  style: 'float',
                }}
                className="inline-block h-auto w-10 opacity-80 hover:opacity-100"
              />
              <span className="hidden sm:inline">
                {header?.name || 'Tina Kitchen Sink'}
              </span>
            </Link>
          </h4>
          <nav className="flex items-center gap-0 sm:gap-1">
            {nav.map((item: any) => {
              const active = isActive(item.href || '/')
              return (
                <Link
                  key={item.href}
                  href={item.href || '/'}
                  className={`relative select-none text-base inline-flex items-center tracking-wide transition duration-150 ease-out opacity-70 hover:opacity-100 px-2 sm:px-4 py-5 ${
                    active
                      ? `opacity-100 ${
                          header?.color === 'primary'
                            ? 'border-b-3 border-white'
                            : activeItemClasses[theme.color] || activeItemClasses.blue
                        } ${
                          header?.color === 'primary'
                            ? ''
                            : activeBackgroundClasses[theme.color] || ''
                        }`
                      : ''
                  }`}
                >
                  {item.label}
                  {active && (
                    <svg
                      className={`absolute bottom-0 left-1/2 w-[180%] h-full -translate-x-1/2 -z-1 opacity-10 dark:opacity-15`}
                      preserveAspectRatio="none"
                      viewBox="0 0 230 230"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <defs>
                        <radialGradient id={`nav-active-${item.href}`}>
                          <stop stopColor="currentColor" />
                          <stop offset="1" stopColor="transparent" />
                        </radialGradient>
                      </defs>
                      <rect
                        x="0"
                        y="0"
                        width="230"
                        height="230"
                        fill={`url(#nav-active-${item.href})`}
                      />
                    </svg>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>
      </Container>
      <div
        className={`absolute h-1 bg-gradient-to-r from-transparent ${
          header?.color === 'primary' ? `via-white` : `via-black dark:via-white`
        } to-transparent bottom-0 left-4 right-4 opacity-5`}
      />
    </header>
  )
}
