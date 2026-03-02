'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLayout } from './layout-context'
import { Container } from './container'
import { Icon } from './icon'

export const Header = () => {
  const { globalSettings, theme } = useLayout()
  const pathname = usePathname()

  const header = globalSettings?.header
  const nav = header?.nav || []

  const headerColor = {
    default:
      'text-gray-800 dark:text-gray-50 from-white to-gray-50 dark:from-gray-900 dark:to-gray-1000',
    primary: {
      blue: 'text-white from-blue-500 to-blue-700',
      teal: 'text-white from-teal-500 to-teal-600',
      green: 'text-white from-green-500 to-green-600',
      red: 'text-white from-red-500 to-red-600',
      pink: 'text-white from-pink-500 to-pink-600',
      purple: 'text-white from-purple-500 to-purple-600',
      orange: 'text-white from-orange-500 to-orange-600',
      yellow: 'text-white from-yellow-500 to-yellow-600',
    } as Record<string, string>,
  }

  const headerColorCss =
    header?.color === 'primary'
      ? headerColor.primary[theme.color] || headerColor.primary.blue
      : headerColor.default

  const activeItemClasses: Record<string, string> = {
    blue: 'border-b-3 border-blue-200',
    teal: 'border-b-3 border-teal-200',
    green: 'border-b-3 border-green-200',
    red: 'border-b-3 border-red-200',
    pink: 'border-b-3 border-pink-200',
    purple: 'border-b-3 border-purple-200',
    orange: 'border-b-3 border-orange-200',
    yellow: 'border-b-3 border-yellow-200',
  }

  const activeBackgroundClasses: Record<string, string> = {
    blue: 'text-blue-600 dark:text-blue-300',
    teal: 'text-teal-600 dark:text-teal-300',
    green: 'text-green-600 dark:text-green-300',
    red: 'text-red-600 dark:text-red-300',
    pink: 'text-pink-600 dark:text-pink-300',
    purple: 'text-purple-600 dark:text-purple-300',
    orange: 'text-orange-600 dark:text-orange-300',
    yellow: 'text-yellow-600 dark:text-yellow-300',
  }

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
