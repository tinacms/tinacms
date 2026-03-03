'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BiMenu, BiX } from 'react-icons/bi'
import { activeItemClasses, activeBackgroundClasses } from '@/lib/utils'

interface MobileNavDrawerProps {
  nav: Array<{ href: string; label: string }>
  theme: { color: string }
  isOpen: boolean
  onClose: () => void
  onOpen: () => void
  headerColor: string
}

export const MobileNavDrawer = ({
  nav,
  theme,
  isOpen,
  onClose,
  onOpen,
  headerColor,
}: MobileNavDrawerProps) => {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname?.startsWith(href)
  }

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      // Prevent body scroll when drawer is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  return (
    <>
      {/* Hamburger Button - Mobile only */}
      <button
        onClick={() => (isOpen ? onClose() : onOpen())}
        aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={isOpen}
        aria-controls="mobile-nav-menu"
        className="sm:hidden relative h-12 w-12 flex-shrink-0 inline-flex items-center justify-center rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
      >
        {isOpen ? (
          <BiX className="h-6 w-6" aria-hidden="true" />
        ) : (
          <BiMenu className="h-6 w-6" aria-hidden="true" />
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 dark:bg-black/50 z-30 sm:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Navigation Drawer */}
      <nav
        id="mobile-nav-menu"
        role="navigation"
        aria-label="Mobile navigation"
        className={`fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 shadow-lg z-40 sm:hidden transform transition-transform duration-200 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            Menu
          </span>
          <button
            onClick={onClose}
            aria-label="Close navigation menu"
            className="h-10 w-10 inline-flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <BiX className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="px-4 py-6 space-y-2">
          {nav.map((item) => {
            const active = isActive(item.href || '/')
            return (
              <Link
                key={item.href}
                href={item.href || '/'}
                onClick={onClose}
                aria-current={active ? 'page' : 'false'}
                className={`block px-4 py-3 rounded-md text-base font-medium transition-colors ${
                  active
                    ? `text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20`
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
