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

import React from 'react'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'
import { ImFilesEmpty } from 'react-icons/im'
import { VscOpenPreview } from 'react-icons/vsc'

import Layout from './components/Layout'
import GetCMS from './components/GetCMS'
import GetCollections from './components/GetCollections'

import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import CollectionListPage from './pages/CollectionListPage'
import CollectionCreatePage from './pages/CollectionCreatePage'
import CollectionUpdatePage from './pages/CollectionUpdatePage'

import useEmbedTailwind from './hooks/useEmbedTailwind'
import { isEditing, setEditing } from '../edit-state'
import { Menu, Transition } from '@headlessui/react'
import { BiExit } from 'react-icons/bi'

const logout = () => {
  setEditing(false)
  window.location.reload()
}

export const TinaAdmin = () => {
  useEmbedTailwind()

  /** TODO: Not all users are Scott Byrne */
  const userName = 'Scott Byrne'

  const isSSR = typeof window === 'undefined'
  if (isSSR) {
    return null
  }

  /**
   * TODO:
   * Ideally, this line should be `const { edit } = useEditState()` if we weren't having context issues with `EditStateProvider`.
   * https://github.com/tinacms/tinacms/issues/2081
   */
  const isEdit = isEditing()
  if (!isEdit) {
    return (
      <Layout>
        <LoginPage />
      </Layout>
    )
  }

  return (
    <GetCMS>
      {(cms) => (
        <GetCollections cms={cms}>
          {(collections) => (
            <Layout>
              <Router>
                <div className="flex items-stretch h-screen overflow-hidden">
                  <div className="flex flex-col w-80 lg:w-96 flex-shrink-0 bg-gradient-to-b from-white to-gray-50 border-r border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h2 className="text-2xl tracking-wide">
                        <Link to={`/admin`}>Tina Admin</Link>
                      </h2>
                    </div>
                    <div className="px-6 py-7 flex-1">
                      <h4 className="uppercase font-bold text-sm mb-3">
                        Collections
                      </h4>
                      <ul>
                        {collections.map((collection) => {
                          return (
                            <li
                              key={`${collection.name}-link`}
                              className="mb-2"
                            >
                              <Link
                                className="text-lg tracking-wide hover:Text-blue-500 flex items-center opacity-90 hover:opacity-100"
                                to={`/admin/collections/${collection.name}`}
                              >
                                <ImFilesEmpty className="mr-2 h-6 opacity-80 w-auto" />{' '}
                                {collection.label}
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                    <div className="flex-0 bg-white border-t border-gray-150">
                      <Menu as="div" className="relative block">
                        {({ open }) => (
                          <div>
                            <Menu.Button
                              className={`group w-full px-6 py-4 flex justify-between items-center transition-colors duration-150 ease-out ${
                                open ? `bg-gray-50` : `bg-transparent`
                              }`}
                            >
                              <span className="flex-0 inline-flex flex-shrink-0 flex-grow-0 items-center justify-center h-9 w-9 rounded-full bg-blue-500 mr-2 opacity-90 group-hover:opacity-100 transition-opacity duration-150 ease-out">
                                <span className="text-lg font-medium leading-none text-white">
                                  {userName.toUpperCase().substr(0, 1)}
                                </span>
                              </span>{' '}
                              <span className="text-left inline-block text-lg text-gray-800 flex-1 opacity-80 group-hover:opacity-100 transition-opacity duration-150 ease-out">
                                {userName}
                              </span>
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className={`flex-0 inline-block opacity-50 group-hover:opacity-80 transition-all duration-300 ease-in-out transform ${
                                  open ? `-rotate-90 opacity-100` : `rotate-0`
                                }`}
                              >
                                <g opacity="0.3">
                                  <path
                                    d="M7.91675 13.8086L9.16675 15.0586L14.2253 10L9.16675 4.9414L7.91675 6.1914L11.7253 10L7.91675 13.8086Z"
                                    fill="currentColor"
                                  />
                                </g>
                              </svg>
                            </Menu.Button>
                            <div className="transform -translate-y-full absolute top-3 right-5 w-2/3">
                              <Transition
                                enter="transition duration-150 ease-out"
                                enterFrom="transform opacity-0 translate-y-2"
                                enterTo="transform opacity-100 translate-y-0"
                                leave="transition duration-75 ease-in"
                                leaveFrom="transform opacity-100 translate-y-0"
                                leaveTo="transform opacity-0 translate-y-2"
                              >
                                <Menu.Items className="w-full py-1 bg-white border border-gray-150 rounded-lg shadow-lg">
                                  <Menu.Item>
                                    {({ active }) => (
                                      <a
                                        className={`text-lg px-4 py-2 tracking-wide flex items-center opacity-80 text-gray-600 ${
                                          active && 'text-gray-800 opacity-100'
                                        }`}
                                        href="/"
                                      >
                                        <VscOpenPreview className="w-6 h-auto mr-1.5 text-blue-400" />{' '}
                                        View Website
                                      </a>
                                    )}
                                  </Menu.Item>
                                  <Menu.Item>
                                    {({ active }) => (
                                      <button
                                        className={`text-lg px-4 py-2 tracking-wide flex items-center opacity-80 text-gray-600 ${
                                          active && 'text-gray-800 opacity-100'
                                        }`}
                                        onClick={() => logout()}
                                      >
                                        <BiExit className="w-6 h-auto mr-1.5 text-blue-400" />{' '}
                                        Log out
                                      </button>
                                    )}
                                  </Menu.Item>
                                </Menu.Items>
                              </Transition>
                            </div>
                          </div>
                        )}
                      </Menu>
                    </div>
                  </div>
                  <div className="px-6 py-14 flex-1 flex justify-center h-screen overflow-y-scroll">
                    <div className="max-w-screen-md w-full h-screen">
                      <Switch>
                        <Route path={`/admin/collections/:collectionName/new`}>
                          <CollectionCreatePage />
                        </Route>
                        <Route
                          path={`/admin/collections/:collectionName/:filename`}
                        >
                          <CollectionUpdatePage />
                        </Route>
                        <Route path={`/admin/collections/:collectionName`}>
                          <CollectionListPage />
                        </Route>
                        <Route path={`/admin`}>
                          <DashboardPage />
                        </Route>
                      </Switch>
                    </div>
                  </div>
                </div>
              </Router>
            </Layout>
          )}
        </GetCollections>
      )}
    </GetCMS>
  )
}
