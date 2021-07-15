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
import Link from 'next/link'
import { useCMS } from 'tinacms'

export const Sidebar = ({
  linkPrefix = '',
  relativePath,
}: {
  linkPrefix?: string
  relativePath: string
}) => {
  const [collections, setCollections] = React.useState<
    {
      slug: string
      path: string
      documents?: { sys: { relativePath: string; breadcrumbs: string[] } }[]
    }[]
  >([])

  const [activeCollections, setActiveCollections] = React.useState<string[]>([])

  const cms = useCMS()

  React.useEffect(() => {
    const listCollections = async () => {
      try {
        const result = await cms.api.tina.request(
          gql => gql`
            query {
              getCollections {
                path
                slug
                label
                documents {
                  sys {
                    filename
                    basename
                    relativePath
                    breadcrumbs(excludeExtension: true)
                    collection {
                      type
                      path
                      slug
                    }
                  }
                }
              }
            }
          `,
          {}
        )
        setCollections(result.getCollections)
        setActiveCollections(
          result.getCollections.find(collectionData =>
            collectionData.documents.find(doc => {
              return doc.sys.relativePath === relativePath
            })
          ).slug
        )
      } catch (e) {
        // console.log("unable to list documents...");
        // console.log(e);
      }
    }
    listCollections()
  }, [])

  return (
    <>
      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col" style={{ width: '21rem' }}>
          <div className="h-0 flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 bg-gray-800 pt-2">
              <div>
                {collections.map(collectionData => {
                  const isActiveCollection = activeCollections.includes(
                    collectionData.slug
                  )
                  return (
                    <React.Fragment key={collectionData.slug}>
                      <button
                        onClick={() => {
                          isActiveCollection
                            ? setActiveCollections([
                                ...activeCollections.filter(
                                  sec => sec !== collectionData.slug
                                ),
                              ])
                            : setActiveCollections([
                                ...activeCollections,
                                collectionData.slug,
                              ])
                        }}
                        className={`mt-1 group w-full flex items-center pr-2 py-2 text-sm leading-5 font-medium rounded-md text-gray-100 hover:bg-gray-600 hover:text-gray-200 focus:outline-none focus:text-gray-200 focus:bg-gray-600 transition ease-in-out duration-150`}
                      >
                        <svg
                          className={`mr-2 h-5 w-5 transform group-hover:text-gray-200 group-focus:text-gray-200 transition-colors ease-in-out duration-150 ${
                            isActiveCollection ? 'rotate-90' : ''
                          }`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M6 6L14 10L6 14V6Z" fill="currentColor" />
                        </svg>
                        {collectionData.slug}
                      </button>
                      <div
                        className={`mt-1 space-y-1 ${
                          isActiveCollection ? '' : 'hidden'
                        }`}
                      >
                        {collectionData.documents?.map(document => {
                          // FIXME: array with null is returned
                          if (!document) {
                            return null
                          }
                          const activeStyles =
                            relativePath === document.sys.relativePath
                              ? 'text-gray-200 bg-gray-600'
                              : ''
                          return (
                            <Link
                              key={`${linkPrefix}/${collectionData.slug}/${document.sys.relativePath}`}
                              href={`${linkPrefix}/${collectionData.slug}/${document.sys.relativePath}`}
                            >
                              <a
                                className={`mb-1 group w-full flex items-center justify-between pl-10 pr-2 py-2 text-sm leading-5 font-medium text-gray-100 rounded-md hover:text-gray-200 hover:bg-gray-600 focus:outline-none focus:text-gray-200 focus:bg-gray-600 transition ease-in-out duration-150 ${activeStyles}`}
                              >
                                {document.sys.breadcrumbs.join('/')}
                              </a>
                            </Link>
                          )
                        })}
                      </div>
                    </React.Fragment>
                  )
                })}
              </div>
            </nav>
          </div>
        </div>
      </div>
    </>
  )
}
