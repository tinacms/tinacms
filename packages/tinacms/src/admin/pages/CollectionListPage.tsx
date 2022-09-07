/**
Copyright 2021 Forestry.io Holdings, Inc.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React, { Fragment } from 'react'
import { BiEdit, BiPlus, BiTrash } from 'react-icons/bi'
import {
  useParams,
  Link,
  useNavigate,
  NavigateFunction,
  useLocation,
} from 'react-router-dom'
import { Menu, Transition } from '@headlessui/react'
import {
  Button,
  Modal,
  ModalActions,
  ModalBody,
  ModalHeader,
  PopupModal,
  TinaCMS,
  OverflowMenu,
  Select,
} from '@tinacms/toolkit'
import type { Collection, Template, DocumentSys } from '../types'
import GetCMS from '../components/GetCMS'
import GetCollection from '../components/GetCollection'
import { RouteMappingPlugin } from '../plugins/route-mapping'
import { PageWrapper, PageHeader, PageBody } from '../components/Page'
import { TinaAdminApi } from '../api'
import { useState } from 'react'
import { CursorPaginator } from '@tinacms/toolkit'
import { useEffect } from 'react'
import type { TinaCloudCollection } from '@tinacms/schema-tools'

const LOCAL_STORAGE_KEY = 'tinacms.admin.collection.list.page'
const isSSR = typeof window === 'undefined'

const TemplateMenu = ({ templates }: { templates: Template[] }) => {
  return (
    <Menu as="div" className="relative inline-block text-left">
      {() => (
        <div>
          <div>
            <Menu.Button className="icon-parent inline-flex items-center font-medium focus:outline-none focus:ring-2 focus:shadow-outline text-center rounded-full justify-center transition-all duration-150 ease-out  shadow text-white bg-blue-500 hover:bg-blue-600 focus:ring-blue-500 text-sm h-10 px-6">
              Create New <BiPlus className="w-5 h-full ml-1 opacity-70" />
            </Menu.Button>
          </div>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="py-1">
                {templates.map((template) => (
                  <Menu.Item key={`${template.label}-${template.name}`}>
                    {({ active }) => (
                      <Link
                        to={`${template.name}/new`}
                        className={`w-full text-md px-4 py-2 tracking-wide flex items-center opacity-80 text-gray-600 ${
                          active && 'text-gray-800 opacity-100'
                        }`}
                      >
                        {template.label}
                      </Link>
                    )}
                  </Menu.Item>
                ))}
              </div>
            </Menu.Items>
          </Transition>
        </div>
      )}
    </Menu>
  )
}

const handleNavigate = (
  navigate: NavigateFunction,
  cms: TinaCMS,
  // FIXME: `Collection` is deceiving because it's just the value we get back from the API request
  collection: Collection,
  // The actual Collection definition
  collectionDefinition: TinaCloudCollection<true>,
  document: DocumentSys
) => {
  /**
   * Retrieve the RouteMapping Plugin
   */
  const plugins = cms.plugins.all<RouteMappingPlugin>('tina-admin')
  const routeMapping = plugins.find(({ name }) => name === 'route-mapping')
  const tinaPreview = cms.flags.get('tina-preview') || false

  /**
   * Determine if the document has a route mapped
   */
  const routeOverride = collectionDefinition.ui?.router
    ? collectionDefinition.ui?.router({
        document,
        collection: collectionDefinition,
      })
    : routeMapping
    ? routeMapping.mapper(collection, document)
    : undefined

  /**
   * Redirect the browser if 'yes', else navigate react-router.
   */
  if (routeOverride) {
    tinaPreview
      ? navigate(`/preview?iframe-url=${encodeURIComponent(routeOverride)}`)
      : (window.location.href = routeOverride)
    return null
  } else {
    navigate(document._sys.breadcrumbs.join('/'))
  }
}

const CollectionListPage = () => {
  const navigate = useNavigate()
  const { collectionName } = useParams()
  const [open, setOpen] = React.useState(false)
  const [vars, setVars] = React.useState({
    collection: collectionName,
    relativePath: '',
  })
  const [endCursor, setEndCursor] = useState('')
  const [prevCursors, setPrevCursors] = useState([])
  const [sortKey, setSortKey] = useState(
    // set sort key to cached value if it exists
    isSSR
      ? ''
      : window.localStorage.getItem(`${LOCAL_STORAGE_KEY}.${collectionName}`) ||
          JSON.stringify({
            order: 'asc',
            name: '',
          })
  )
  const [sortOrder, setSortOrder] = useState('asc' as 'asc' | 'desc')
  const loc = useLocation()
  useEffect(() => {
    // set sort key to cached value on route change
    setSortKey(
      window.localStorage.getItem(`${LOCAL_STORAGE_KEY}.${collectionName}`) ||
        JSON.stringify({
          order: 'asc',
          name: '',
        })
    )
    // reset state when the route is changed
    setEndCursor('')
    setPrevCursors([])
  }, [loc])

  return (
    <GetCMS>
      {(cms: TinaCMS) => {
        return (
          <GetCollection
            cms={cms}
            collectionName={collectionName}
            includeDocuments
            startCursor={endCursor}
            sortKey={sortKey}
          >
            {(
              collection: Collection,
              _loading,
              reFetchCollection,
              collectionExtra: TinaCloudCollection<true>
            ) => {
              const totalCount = collection.documents.totalCount
              const documents = collection.documents.edges
              const admin: TinaAdminApi = cms.api.admin
              const pageInfo = collection.documents.pageInfo
              const fields = collectionExtra.fields?.filter((x) =>
                // only allow sortable fields
                ['string', 'number', 'datetime', 'boolean'].includes(x.type)
              )
              const collectionDefinition = cms.api.tina.schema.getCollection(
                collection.name
              )

              return (
                <PageWrapper>
                  <>
                    {open && (
                      <DeleteModal
                        filename={vars.relativePath}
                        deleteFunc={async () => {
                          try {
                            await admin.deleteDocument(vars)
                            cms.alerts.info('Document was successfully deleted')
                            reFetchCollection()
                          } catch (error) {
                            cms.alerts.warn(
                              'Document was not deleted, ask a developer for help or check the console for an error message'
                            )
                            console.error(error)
                            throw error
                          }
                        }}
                        close={() => setOpen(false)}
                      />
                    )}

                    <PageHeader isLocalMode={cms?.api?.tina?.isLocalMode}>
                      <>
                        <div className="flex flex-col gap-4">
                          <h3 className="font-sans text-2xl text-gray-700">
                            {collection.label
                              ? collection.label
                              : collection.name}
                          </h3>

                          {fields?.length > 0 && (
                            <div className="flex gap-2 items-center">
                              <label
                                htmlFor="sort"
                                className="block font-sans text-xs font-semibold text-gray-500 whitespace-normal"
                              >
                                Sort by
                              </label>
                              <Select
                                name="sort"
                                options={[
                                  {
                                    label: 'Default',
                                    value: JSON.stringify({
                                      order: 'asc',
                                      name: '',
                                    }),
                                  },
                                  ...fields
                                    .map((x) => [
                                      {
                                        label: x.label + ' (Ascending)',
                                        value: JSON.stringify({
                                          name: x.name,
                                          order: 'asc',
                                        }),
                                      },
                                      {
                                        label: x.label + ' (Descending)',
                                        value: JSON.stringify({
                                          name: x.name,
                                          order: 'desc',
                                        }),
                                      },
                                    ])
                                    .flat(),
                                ]}
                                input={{
                                  id: 'sort',
                                  name: 'sort',
                                  value: sortKey,
                                  onChange: (e) => {
                                    const val = JSON.parse(e.target.value)
                                    setEndCursor('')
                                    setPrevCursors([])
                                    window?.localStorage.setItem(
                                      `${LOCAL_STORAGE_KEY}.${collectionName}`,
                                      e.target.value
                                    )
                                    setSortKey(e.target.value)
                                    setSortOrder(val.order)
                                  },
                                }}
                              />
                            </div>
                          )}
                        </div>
                        {!collection.templates && (
                          <Link
                            to={`new`}
                            className="icon-parent inline-flex items-center font-medium focus:outline-none focus:ring-2 focus:shadow-outline text-center rounded-full justify-center transition-all duration-150 ease-out  shadow text-white bg-blue-500 hover:bg-blue-600 focus:ring-blue-500 text-sm h-10 px-6"
                          >
                            Create New{' '}
                            <BiPlus className="w-5 h-full ml-1 opacity-70" />
                          </Link>
                        )}
                        {collection.templates && (
                          <TemplateMenu templates={collection.templates} />
                        )}
                      </>
                    </PageHeader>
                    <PageBody>
                      <div className="w-full mx-auto max-w-screen-xl">
                        {totalCount > 0 && (
                          <table className="table-auto shadow bg-white border-b border-gray-200 w-full max-w-full rounded-lg">
                            <tbody className="divide-y divide-gray-150">
                              {documents.map((document) => {
                                const hasTitle = Boolean(
                                  document.node._sys.title
                                )
                                const subfolders =
                                  document.node._sys.breadcrumbs
                                    .slice(0, -1)
                                    .join('/')

                                return (
                                  <tr
                                    key={`document-${document.node._sys.relativePath}`}
                                    className=""
                                  >
                                    <td className="px-6 py-2 whitespace-nowrap">
                                      <a
                                        className="text-blue-600 hover:text-blue-400 flex items-center gap-3 cursor-pointer"
                                        onClick={() => {
                                          handleNavigate(
                                            navigate,
                                            cms,
                                            collection,
                                            collectionDefinition,
                                            document.node
                                          )
                                        }}
                                      >
                                        <BiEdit className="inline-block h-6 w-auto opacity-70" />
                                        <span>
                                          <span className="block text-xs text-gray-400 mb-1 uppercase">
                                            {hasTitle ? 'Title' : 'Filename'}
                                          </span>
                                          <span className="h-5 leading-5 block whitespace-nowrap">
                                            {subfolders && (
                                              <span className="text-xs text-gray-400">
                                                {`${subfolders}/`}
                                              </span>
                                            )}
                                            <span>
                                              {hasTitle
                                                ? document.node._sys?.title
                                                : document.node._sys.filename}
                                            </span>
                                          </span>
                                        </span>
                                      </a>
                                    </td>
                                    {hasTitle && (
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="block text-xs text-gray-400 mb-1 uppercase">
                                          Filename
                                        </span>
                                        <span className="h-5 leading-5 block text-sm font-medium text-gray-900">
                                          {document.node._sys.filename}
                                        </span>
                                      </td>
                                    )}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className="block text-xs text-gray-400 mb-1 uppercase">
                                        Extension
                                      </span>
                                      <span className="h-5 leading-5 block text-sm font-medium text-gray-900">
                                        {document.node._sys.extension}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className="block text-xs text-gray-400 mb-1 uppercase">
                                        Template
                                      </span>
                                      <span className="h-5 leading-5 block text-sm font-medium text-gray-900">
                                        {document.node._sys.template}
                                      </span>
                                    </td>
                                    <td className="w-0">
                                      <OverflowMenu
                                        toolbarItems={[
                                          {
                                            name: 'edit',
                                            label: 'Edit in Admin',
                                            Icon: <BiEdit size="1.3rem" />,
                                            onMouseDown: () => {
                                              navigate(
                                                `${document.node._sys.breadcrumbs.join(
                                                  '/'
                                                )}`,
                                                { replace: true }
                                              )
                                            },
                                          },
                                          {
                                            name: 'delete',
                                            label: 'Delete',
                                            Icon: (
                                              <BiTrash
                                                size="1.3rem"
                                                className="text-red-500"
                                              />
                                            ),
                                            onMouseDown: () => {
                                              setVars({
                                                collection: collectionName,
                                                relativePath:
                                                  document.node._sys.breadcrumbs.join(
                                                    '/'
                                                  ) +
                                                  document.node._sys.extension,
                                              })
                                              setOpen(true)
                                            },
                                          },
                                        ]}
                                      />
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        )}
                        <div className="pt-3">
                          <CursorPaginator
                            variant="white"
                            hasNext={
                              sortOrder === 'asc'
                                ? pageInfo?.hasNextPage
                                : pageInfo.hasPreviousPage
                            }
                            navigateNext={() => {
                              const newState = [...prevCursors, endCursor]
                              setPrevCursors(newState)
                              setEndCursor(pageInfo?.endCursor)
                            }}
                            hasPrev={prevCursors.length > 0}
                            navigatePrev={() => {
                              const prev = prevCursors[prevCursors.length - 1]
                              if (typeof prev === 'string') {
                                const newState = prevCursors.slice(0, -1)
                                setPrevCursors(newState)
                                setEndCursor(prev)
                              }
                            }}
                          />
                        </div>
                      </div>
                    </PageBody>
                  </>
                </PageWrapper>
              )
            }}
          </GetCollection>
        )
      }}
    </GetCMS>
  )
}
interface ResetModalProps {
  close(): void
  deleteFunc(): void
  filename: string
}

const DeleteModal = ({ close, deleteFunc, filename }: ResetModalProps) => {
  return (
    <Modal>
      <PopupModal>
        <ModalHeader close={close}>Delete {filename}</ModalHeader>
        <ModalBody padded={true}>
          <p>{`Are you sure you want to delete ${filename}?`}</p>
        </ModalBody>
        <ModalActions>
          <Button style={{ flexGrow: 2 }} onClick={close}>
            Cancel
          </Button>
          <Button
            style={{ flexGrow: 3 }}
            variant="danger"
            onClick={async () => {
              await deleteFunc()
              close()
            }}
          >
            Delete
          </Button>
        </ModalActions>
      </PopupModal>
    </Modal>
  )
}
export default CollectionListPage
