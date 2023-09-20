'use client'

import { PageQuery } from '@/tina/__generated__/types'
import { Disclosure } from '@headlessui/react'
import { ChevronRightIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { VersionSelect } from './version-select'
export function Layout({
  result,
  parent,
  children,
}: {
  result: { data: PageQuery }
  parent?: { data: PageQuery }
  children: React.ReactNode
}) {
  const pathname = usePathname()
  if (result.data.page.__typename !== 'PageOverview') {
    throw new Error('Expected overview document to be of overview template')
  }
  return (
    <div className="h-screen w-full flex">
      <div className="h-screen w-64 bg-white flex flex-col gap-2 overflow-scroll p-4 border-r border-slate-200">
        {parent && parent?.data.page.id !== result.data.page.id && (
          <div className="py-4 border-b border-slate-200">
            <VersionSelect />
          </div>
        )}
        {parent && parent?.data.page.id !== result.data.page.id && (
          <div className="py-4">
            <Link
              href={`/${parent?.data.page._sys.breadcrumbs
                .filter((item) => item !== '_overview')
                .join('/')}`}
              className="text-xs font-semibold leading-6 text-gray-400  flex gap-2 items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                />
              </svg>
              Back to {parent?.data.page?.title}
            </Link>
          </div>
        )}
        <nav className="flex flex-1 flex-col" aria-label="Sidebar">
          <ul>
            {result.data.page.sidebar?.sections?.map((section) => {
              return (
                <li key={section?.title} className="pb-8">
                  <div className="text-xs font-semibold leading-6 text-gray-400">
                    {section?.title}
                  </div>
                  <ul
                    key={section?.title}
                    role="list"
                    className="-mx-2 space-y-1 py-4"
                  >
                    {section?.items?.map((item) => {
                      if (
                        item?.__typename ===
                        'PageOverviewSidebarSectionsItemsDirectPageLink'
                      ) {
                        const isSelected =
                          pathname ===
                          item!.reference?._sys.path
                            .replace('content/pages', '')
                            .replace('.mdx', '')

                        return (
                          <li key={item?.label}>
                            <Link
                              href={`/${
                                item?.reference?._sys.breadcrumbs
                                  .filter((item) => item !== '_overview')
                                  .join('/') || ''
                              }`}
                              className={classNames(
                                isSelected
                                  ? 'bg-gray-50 text-indigo-600'
                                  : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50',
                                'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                              )}
                            >
                              {item?.label}
                            </Link>
                          </li>
                        )
                      } else {
                        return (
                          <li key={item?.label}>
                            <Disclosure as="div">
                              {({ open }) => (
                                <>
                                  <Disclosure.Button
                                    className={classNames(
                                      false ? 'bg-gray-50' : 'hover:bg-gray-50',
                                      'flex items-center w-full text-left rounded-md p-2 gap-x-3 text-sm leading-6 font-semibold text-gray-700'
                                    )}
                                  >
                                    {/* <item.icon className="h-6 w-6 shrink-0 text-gray-400" aria-hidden="true" /> */}
                                    {item?.label}
                                    <ChevronRightIcon
                                      className={classNames(
                                        open
                                          ? 'rotate-90 text-gray-500'
                                          : 'text-gray-400',
                                        'ml-auto h-5 w-5 shrink-0'
                                      )}
                                      aria-hidden="true"
                                    />
                                  </Disclosure.Button>
                                  <Disclosure.Panel
                                    as="ul"
                                    className="mt-1 px-2"
                                  >
                                    {item?.children?.map((subItem) => {
                                      const isSelected =
                                        pathname ===
                                        subItem!.reference?._sys.path
                                          .replace('content/pages', '')
                                          .replace('.mdx', '')

                                      if (
                                        subItem?.reference?.__typename ===
                                        'PageContent'
                                      ) {
                                        return (
                                          <li key={subItem?.reference?.id}>
                                            {/* 44px */}
                                            <Link
                                              href={`/${subItem?.reference?._sys.breadcrumbs.join(
                                                '/'
                                              )}`}
                                              className={classNames(
                                                isSelected
                                                  ? 'bg-gray-50'
                                                  : 'hover:bg-gray-50',
                                                'block rounded-md py-2 pr-2 pl-4 text-sm leading-6 text-gray-700'
                                              )}
                                            >
                                              {subItem?.reference.title}
                                            </Link>
                                          </li>
                                        )
                                      } else {
                                        throw new Error(`Exptected refern`)
                                      }
                                    })}
                                  </Disclosure.Panel>
                                </>
                              )}
                            </Disclosure>
                          </li>
                        )
                      }
                    })}
                  </ul>
                  <div className="border-b border-gray-100 w-full pt-4" />
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
      <div className="flex-1">
        <div className="h-10 border-b border-slate-200"></div>
        <div className="px-20 py-10">{children}</div>
      </div>
    </div>
  )
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}
