import { Dialog, Transition } from '@headlessui/react'
import { XIcon } from '@heroicons/react/outline'
import matter from 'gray-matter'
import React, { Fragment, useMemo } from 'react'

interface Field {
  name: string
  label: string
  type: string
  fields?: Field[]
  list?: boolean
}

const getFields = (data: any): Field[] => {
  return Object.keys(data).map((field) => {
    let type: string = typeof data[field]
    if (type == 'object' && Array.isArray(data[field])) {
      type = 'array'
    }

    if (type == 'array') {
      if (data[field].length) {
        if (typeof data[field][0] == 'object') {
          return {
            name: field,
            label: field,
            type: 'object',
            fields: getFields(data[field][0]),
            list: true,
          }
        } else {
          //primitive type group
          return {
            name: field,
            label: field,
            type: typeof data[field][0],
            list: true,
          }
        }
      } else {
        // nothing in list to tell the possible type
        return { name: field, label: field, type: 'string', list: true }
      }
    }

    const fields = type == 'object' ? getFields(data[field]) : []
    return { name: field, label: field, type: type, fields }
  })
}

const createCollectionDef = (
  name: string,
  collectionPath: string,
  markdown: string
) => {
  const data = matter(markdown)
  const fields = getFields(data.data)

  const collectionDef = {
    name,
    label: name,
    path: collectionPath.split('/').slice(0, -1).join('/'),
    fields,
  }

  return collectionDef
}

export default function SchemaPreview({ markdownFile }: any) {
  const collection = createCollectionDef(
    'collection-name',
    'path/to/collection',
    markdownFile
  )

  return (
    <Transition.Root show={true} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 overflow-hidden"
        onClose={() => {}}
      >
        <div className="absolute inset-0 overflow-hidden">
          <Dialog.Overlay className="absolute inset-0" />

          <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-500 sm:duration-700"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-500 sm:duration-700"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <div className="w-screen max-w-md">
                <div className="h-full flex flex-col py-6 bg-white shadow-xl overflow-y-scroll">
                  <div className="px-4 sm:px-6">
                    <div className="flex items-start justify-between">
                      <Dialog.Title className="text-lg font-medium text-gray-900">
                        Your generated schema
                      </Dialog.Title>
                      <div className="ml-3 h-7 flex items-center">
                        <button
                          type="button"
                          className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <span className="sr-only">Close panel</span>
                          <XIcon className="h-6 w-6" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 relative flex-1 px-4 sm:px-6">
                    <code>
                      <pre>{JSON.stringify(collection, null, 4)}</pre>
                    </code>
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
