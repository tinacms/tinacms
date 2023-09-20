'use client'

import {
  PageQuery,
  PageSidebar,
  PageSidebarSidebarSections,
  PageVersionedSidebarVersionedSidebarVersionsSidebarSectionsItemsDirectPageLink,
} from '@/tina/__generated__/types'
import { Disclosure } from '@headlessui/react'
import { ChevronRightIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { VersionSelect } from './version-select'

export function Layout({
  sidebars,
  children,
}: {
  sidebars: { data: PageQuery }[]
  children: React.ReactNode
}) {
  const currentSidebar = sidebars[0]

  switch (currentSidebar.data.page.__typename) {
    case 'PageSidebar': {
      return (
        <Wrapper sidebar={<Sidebar {...currentSidebar.data.page} />}>
          {children}
        </Wrapper>
      )
    }
    case 'PageVersionedSidebar': {
      return <Wrapper sidebar={'Versioned Sidebar'}>{children}</Wrapper>
    }
  }
}

const Wrapper = (props: {
  sidebar: React.ReactNode
  children: React.ReactNode
}) => {
  return (
    <div className="h-screen w-full flex">
      <div className="h-screen w-64 bg-white flex flex-col gap-2 overflow-scroll p-4 border-r border-slate-200">
        {props.sidebar}
      </div>
      <div className="flex-1">
        <div className="h-10 border-b border-slate-200"></div>
        <div className="px-20 py-10">{props.children}</div>
      </div>
    </div>
  )
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

const Sidebar = (props: Omit<PageSidebar, '_values' | '_sys'>) => {
  return (
    <nav className="flex flex-1 flex-col" aria-label="Sidebar">
      <ul>
        {props.sidebar?.sections?.map((section) => (
          <Section key={section?.title} {...section} />
        ))}
      </ul>
    </nav>
  )
}
const Section = (props: PageSidebarSidebarSections) => {
  return (
    <li className="pb-8">
      <div className="text-xs font-semibold leading-6 text-gray-400">
        {props.title}
      </div>
      <ul key={props?.title} role="list" className="-mx-2 space-y-1 py-4">
        {props?.items?.map((item) => {
          if (
            item?.__typename ===
            'PageVersionedSidebarVersionedSidebarVersionsSidebarSectionsItemsDirectPageLink'
          ) {
            // const isSelected =
            //   pathname ===
            //   item!.reference?._sys.path
            //     .replace('content/pages', '')
            //     .replace('/_overview.mdx', '')
            //     .replace('.mdx', '')

            return (
              <li key={item?.label}>
                <Link
                  href={getSidebarItemLink(item)}
                  className={classNames(
                    false
                      ? // isSelected
                        'bg-gray-50 text-indigo-600'
                      : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50',
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
                            open ? 'rotate-90 text-gray-500' : 'text-gray-400',
                            'ml-auto h-5 w-5 shrink-0'
                          )}
                          aria-hidden="true"
                        />
                      </Disclosure.Button>
                      <Disclosure.Panel as="ul" className="mt-1 px-2">
                        {item?.children?.map((subItem) => {
                          // const isSelected =
                          //   pathname ===
                          //   subItem!.reference?._sys.path
                          //     .replace('content/pages', '')
                          //     .replace('/_overview.mdx', '')
                          //     .replace('.mdx', '')

                          if (
                            subItem?.reference?.__typename === 'PageContent'
                          ) {
                            return (
                              <li key={subItem?.reference?.id}>
                                <Link
                                  href={getSidebarItemLink(subItem)}
                                  className={classNames(
                                    false
                                      ? // isSelected
                                        'bg-gray-50 text-indigo-600'
                                      : 'hover:text-indigo-600 hover:bg-gray-50',
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
}

const getSidebarItemLink = (
  item: PageVersionedSidebarVersionedSidebarVersionsSidebarSectionsItemsDirectPageLink
) => {
  if (item.reference?.__typename === 'PageVersionedSidebar') {
    const latestVersion = item?.reference?.versionedSidebar?.versions?.at(0)
    if (latestVersion) {
      const path = [
        ...item.reference._sys.breadcrumbs.slice(
          0,
          item.reference._sys.breadcrumbs.length - 1
        ),
        latestVersion.name,
      ]
      return `/${path.join('/')}`
    } else {
      throw new Error(`Expected versioned sidebar to have a "versions" array`)
    }
  } else {
    return `/${
      item?.reference?._sys.breadcrumbs
        .filter((item) => !['_overview', '_sidebar'].includes(item))
        .join('/') || ''
    }`
  }
}

const VersionedSidebar = () => {}
