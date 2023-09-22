'use client'

import {
  PageQuery,
  PageSidebarSidebarSections,
  PageVersionedSidebar,
  PageVersionedSidebarVersionedSidebarVersionsSidebarSectionsItemsDirectPageLink,
  PageVersionedSidebarVersionedSidebarVersionsSidebarSectionsItemsDropdownLinkChildren,
} from '@/tina/__generated__/types'
import { Disclosure } from '@headlessui/react'
import { ChevronRightIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { VersionSelect } from './version-select'
import { PageResultWithActiveVersion } from '@/lib'

export function Layout({
  sidebars,
  page,
  children,
}: {
  sidebars: PageResultWithActiveVersion[]
  page: PageQuery['page']
  children: React.ReactNode
}) {
  const currentSidebar = sidebars[0]

  switch (currentSidebar.data.page.__typename) {
    case 'PageSidebar': {
      return (
        <Wrapper
          sidebars={sidebars}
          page={page}
          sidebar={<Sidebar {...currentSidebar} sidebars={sidebars} />}
        >
          {children}
        </Wrapper>
      )
    }
    case 'PageVersionedSidebar': {
      return (
        <Wrapper
          sidebars={sidebars}
          page={page}
          sidebar={<VersionedSidebar {...currentSidebar} sidebars={sidebars} />}
        >
          {children}
        </Wrapper>
      )
    }
    default: {
      return null
    }
  }
}

const Wrapper = (props: {
  sidebar: React.ReactNode
  sidebars: PageResultWithActiveVersion[]
  page: PageQuery['page']
  children: React.ReactNode
}) => {
  return (
    <div className="h-screen w-full flex">
      <div className="h-screen w-64 bg-white flex flex-col gap-2 overflow-scroll p-4 border-r border-slate-200">
        <Link href="/en/pixyz" className="flex items-center gap-5 pb-5">
          <div className="p-2 rounded-full bg-red-500 text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
              />
            </svg>
          </div>
          <div>
            <div className="text-xs font-semibold leading-6 text-gray-400 leading-5">
              Documentation
            </div>
            <div className="text-sm font-semibold leading-6 text-gray-600 leading-5">
              Pixyz
            </div>
          </div>
        </Link>
        {props.sidebar}
      </div>
      <div className="flex-1">
        <div className="h-10 border-b border-slate-200"></div>
        <div className="px-20 py-10 max-w-5xl m-auto">
          <Breadcrumbs sidebars={props.sidebars} page={props.page} />
          {props.children}
        </div>
      </div>
    </div>
  )
}

export function Breadcrumbs(props: {
  sidebars: PageResultWithActiveVersion[]
  page: PageQuery['page']
}) {
  return (
    <nav className="flex pb-8" aria-label="Breadcrumb">
      <ol role="list" className="flex items-center space-x-4">
        {props.sidebars
          .slice()
          .reverse()
          .map((sidebar, i) => {
            if (i === 0) {
              return (
                <li key={sidebar.data.page.title}>
                  <div>
                    <Link
                      href={getSidebarItemLinkInner(sidebar.data.page)}
                      className="text-sm font-medium text-gray-500 hover:text-gray-700"
                      // aria-current={page.current ? 'page' : undefined}
                    >
                      {sidebar.data.page.title}
                    </Link>
                  </div>
                </li>
              )
            }
            return (
              <li key={sidebar.data.page.title}>
                <div className="flex items-center">
                  <ChevronRightIcon
                    className="h-5 w-5 flex-shrink-0 text-gray-400"
                    aria-hidden="true"
                  />
                  <Link
                    href={getSidebarItemLinkInner(sidebar.data.page)}
                    className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
                    // aria-current={page.current ? 'page' : undefined}
                  >
                    {sidebar.data.page.title}
                  </Link>
                </div>
              </li>
            )
          })}
        {props.page._sys.filename !== '_overview' ? (
          <li>
            <div className="flex items-center">
              <ChevronRightIcon
                className="h-5 w-5 flex-shrink-0 text-gray-400"
                aria-hidden="true"
              />
              <span className="ml-4 text-sm font-medium text-gray-500">
                {props.page.title}
              </span>
            </div>
          </li>
        ) : (
          <li>
            <div className="flex items-center">
              <ChevronRightIcon
                className="h-5 w-5 flex-shrink-0 text-gray-400"
                aria-hidden="true"
              />
              <span className="ml-4 text-sm font-medium text-gray-500">
                Overview
              </span>
            </div>
          </li>
        )}
      </ol>
    </nav>
  )
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

const VersionedSidebar = (
  props: PageResultWithActiveVersion & {
    sidebars: { data: PageQuery }[]
  }
) => {
  if (props.data.page.__typename === 'PageVersionedSidebar') {
    const parent = props.sidebars[1]
    // TODO: choose the correct version
    let activeVersion = props.data.page.versionedSidebar?.versions?.find(
      (v) => v?.name === props.data.page.activeVersion
    )
    if (!activeVersion) {
      activeVersion = props.data.page?.versionedSidebar?.versions?.at(0)
    }
    return (
      <div key={activeVersion?.name}>
        <VersionSelect {...props} />
        {parent && <BackToLink parent={parent} />}
        <nav
          key={activeVersion?.name}
          className="flex flex-1 flex-col"
          aria-label="Sidebar"
        >
          <ul>
            {activeVersion?.sidebar?.sections?.map((section) => (
              <Section key={section?.title} {...section} />
            ))}
          </ul>
        </nav>
      </div>
    )
  } else {
    return null
  }
}

const BackToLink = ({ parent }: { parent: any }) => {
  return (
    <div className="py-6">
      <Link
        // href={`/${filterBreadcrumbs(parent?.data.page._sys.breadcrumbs)}`}
        href={getSidebarItemLinkInner(parent?.data.page)}
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
  )
}

const Sidebar = (
  props: PageResultWithActiveVersion & {
    sidebars: PageResultWithActiveVersion[]
  }
) => {
  const parent = props.sidebars[1]
  const sidebarParent = props.sidebars.find(
    (s) => s.data.page.__typename === 'PageVersionedSidebar'
  )
  if (props.data.page.__typename === 'PageSidebar') {
    return (
      <nav className="flex flex-1 flex-col" aria-label="Sidebar">
        {sidebarParent?.data.page.__typename === 'PageVersionedSidebar' && (
          <VersionSelect {...sidebarParent} />
        )}
        {parent && <BackToLink parent={parent} />}
        <ul>
          {props.data.page.sidebar?.sections?.map((section) => (
            <Section key={section?.title} {...section} />
          ))}
        </ul>
      </nav>
    )
  }
  return null
}
type Nullable<T> = {
  [P in keyof T]?: Nullable<T[P]> | null
}
const Section = (
  props: Nullable<Omit<PageSidebarSidebarSections, '__typename'>>
) => {
  const currPath = usePathname()

  const isSelected = (item: any) => {
    if (item!.children?.length) {
      return item!.children.some((child: any) => {
        return isSelected(child)
      })
    } else {
      const itemPath = item.reference._sys
        .path!.replace('content/pages', '')
        .replace('/_overview.mdx', '')
        .replace('.mdx', '')
      return currPath === itemPath
    }
  }

  return (
    <li className="pb-5">
      <div className="text-xs font-semibold leading-6 text-gray-400">
        {props.title}
      </div>
      <ul key={props?.title} role="list" className="-mx-2 space-y-1 py-4">
        {props?.items?.map((item) => {
          if (
            item?.__typename ===
            'PageVersionedSidebarVersionedSidebarVersionsSidebarSectionsItemsDirectPageLink'
          ) {
            return (
              <li key={item?.label}>
                <Link
                  href={getSidebarItemLink(item)}
                  className={classNames(
                    isSelected(item!)
                      ? 'bg-gray-50 text-gray-600'
                      : 'text-gray-700 hover:text-gray-600 hover:bg-gray-50',
                    'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                  )}
                >
                  {item?.label}
                </Link>
              </li>
            )
          }
          if (
            item?.__typename ===
            'PageVersionedSidebarVersionedSidebarVersionsSidebarSectionsItemsDropdownLink'
          ) {
            return (
              <li key={item?.label}>
                <Disclosure as="div" defaultOpen={isSelected(item!)}>
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
                            open ? 'rotate-90 text-gray-500' : 'text-gray-400',
                            'ml-auto h-5 w-5 shrink-0'
                          )}
                          aria-hidden="true"
                        />
                      </Disclosure.Button>
                      <Disclosure.Panel as="ul" className="mt-1 px-2">
                        {item?.children?.map((subItem) => {
                          if (subItem) {
                            subItem.__typename ===
                              'PageVersionedSidebarVersionedSidebarVersionsSidebarSectionsItemsDropdownLinkChildren'
                            return (
                              <li key={subItem?.reference?.id}>
                                <Link
                                  href={getSidebarItemLink(subItem)}
                                  className={classNames(
                                    isSelected(subItem!)
                                      ? 'bg-gray-50 text-gray-600'
                                      : 'hover:text-gray-600 hover:bg-gray-50',
                                    'block rounded-md py-2 pr-2 pl-4 text-sm leading-6 text-gray-700'
                                  )}
                                >
                                  {subItem?.reference?.title}
                                </Link>
                              </li>
                            )
                          } else {
                            return null
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
}
const getSidebarItemLink = (
  item?:
    | Nullable<
        Omit<
          PageVersionedSidebarVersionedSidebarVersionsSidebarSectionsItemsDirectPageLink,
          '__typename'
        >
      >
    | Nullable<
        Omit<
          PageVersionedSidebarVersionedSidebarVersionsSidebarSectionsItemsDropdownLinkChildren,
          '__typename'
        >
      >
    | null
) => {
  return getSidebarItemLinkInner(item?.reference)
}

const getSidebarItemLinkInner = (
  page: Nullable<PageResultWithActiveVersion['data']['page']> | null | undefined
) => {
  if (page) {
    if (page.__typename === 'PageVersionedSidebar') {
      // This should be based on which version is active
      let activeVersion = page?.versionedSidebar?.versions?.find(
        (v) => v?.name === page.activeVersion
      )
      if (!activeVersion) {
        activeVersion = page?.versionedSidebar?.versions?.at(0)
      }
      if (activeVersion) {
        const path = [
          ...(page?._sys?.breadcrumbs?.slice(
            0,
            page?._sys?.breadcrumbs?.length - 1
          ) || []),
          activeVersion.name,
        ]
        return `/${path.join('/')}`
      } else {
        console.error('No version found')
        return ''
        // throw new Error(`Expected versioned sidebar to have a "versions" array`)
      }
    } else {
      return `/${filterBreadcrumbs(page?._sys?.breadcrumbs || [])}`
    }
  }
  return '/'
}

export const filterBreadcrumbs = (
  breadcrumbs: (string | null | undefined)[] = []
) => {
  if (!breadcrumbs) {
    return ''
  }
  return (
    breadcrumbs
      .filter((item) => {
        if (typeof item === 'string') {
          return !['_overview', '_sidebar'].includes(item)
        }
        return true
      })
      .join('/') || ''
  )
}
