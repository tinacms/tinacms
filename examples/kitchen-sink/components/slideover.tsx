/**

*/

import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { client } from '../tina/__generated__/client'
import Navigation from './navigation'
import type { MenuQueryQuery } from '../tina/__generated__/types'

type Item = {
  name: string
  current: boolean
  children: { name: string; href: string }
}
export const useCollections = (): Item[] => {
  const [collections, setCollections] = useState<MenuQueryQuery>([])

  useEffect(() => {
    const run = async () => {
      const res = await client.queries.MenuQuery()
      const items = res.data.collections
        .filter((collection) => {
          // Only show items which have matching routes
          if (
            ['page', 'post', 'documentation', 'ssgPost'].includes(
              collection.name
            )
          ) {
            return true
          }
          return false
        })
        .map((collection) => {
          return {
            name: collection.label,
            current: false,
            children: collection.documents.edges.map((edge) => {
              return {
                name: edge.node._sys.filename,
                href: `/${collection.name}/${edge.node._sys.filename}`,
              }
            }),
          }
        })
      setCollections(items)
    }
    run()
  }, [])
  return collections
}

export default function Example() {
  const [open, setOpen] = useState(false)
  const collections = useCollections()

  return (
    <div className="w-full flex justify-end p-3">
      <button
        type="button"
        onClick={() => setOpen((open) => !open)}
        className="inline-flex items-center rounded-md border border-transparent bg-indigo-100 px-3 py-2 text-sm font-medium leading-4 text-indigo-700 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Nav
      </button>
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setOpen}>
          <div className="fixed inset-0" />

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                <Transition.Child
                  as={Fragment}
                  enter="transform transition ease-in-out duration-500 sm:duration-700"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-500 sm:duration-700"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                    <div className="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
                      <div className="px-4 sm:px-6">
                        <div className="flex items-start justify-between">
                          <Dialog.Title className="text-lg font-medium text-gray-900">
                            Documents
                          </Dialog.Title>
                          <div className="ml-3 flex h-7 items-center">
                            <button
                              type="button"
                              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                              onClick={() => setOpen(false)}
                            >
                              <span className="sr-only">Close panel</span>
                              <XMarkIcon
                                className="h-6 w-6"
                                aria-hidden="true"
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="relative flex-1">
                        <Navigation items={collections} />
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  )
}
