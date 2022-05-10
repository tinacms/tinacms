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

import { Db, readDb, writeDb } from './db'

/**
 * Recursively unwraps the "awaited type" of a type. Non-promise "thenables" should resolve to `never`. This emulates the behavior of `await`.
 */
type Awaited<T> = T extends null | undefined
  ? T // special case for `null | undefined` when not in `--strictNullChecks` mode
  : T extends object & { then(_: infer F): any } // `await` only unwraps object types with a callable `then`. Non-object types are not unwrapped
  ? F extends (_: infer V, ...__: any) => any // if the argument to `then` is callable, extracts the first argument
    ? Awaited<V> // recursively unwrap the value
    : never // the argument to `then` was not callable
  : T // non-object or non-thenable

export class Paginate<
  RetrieverFunc extends (_: {
    first: number
    after: string
    sort: string
  }) => Promise<unknown>
> {
  retriever: RetrieverFunc
  perPage: number
  sortedBy: string

  constructor(retriever: RetrieverFunc, perPage: number, sortedBy: string) {
    this.retriever = retriever
    this.perPage = perPage
    this.sortedBy = sortedBy
  }

  findPageInfo(response) {
    const data = response.data

    for (const i in data) {
      if (data[i].pageInfo) {
        return data[i].pageInfo
      }
    }
  }

  public async getPaths() {
    const db: Db = {
      pages: [],
    }
    const paths: { params: { page: string } }[] = []

    const retrievePage = async (page, first, after, sort) => {
      const response = (await this.retriever({
        first,
        after,
        sort,
      })) as Awaited<Promise<RetrieverFunc>>

      const pageInfo = this.findPageInfo(response)

      db.pages.push({
        first,
        after,
        sort,
      })

      paths.push({
        params: {
          page: `${page}`,
        },
      })

      if (pageInfo.hasNextPage) {
        const nextPage = page + 1
        return retrievePage(nextPage, first, pageInfo.endCursor, sort)
      }
    }

    await retrievePage(1, this.perPage, undefined, this.sortedBy)
    await writeDb(db)

    return paths
  }

  public async getPage(page: number): Promise<{
    page: Awaited<ReturnType<RetrieverFunc>>
    pageInfo: {
      prevPage: number | string
      nextPage: number | string
      currentPage: number
      pageList: number[]
    }
  }> {
    const db = await readDb()
    let variables: { first: number; after: string; sort: string }

    try {
      variables = db.pages[page - 1]
    } catch (e) {
      throw Error(`[Error] Unable to find page matching ${page}: ${e.message}`)
    }

    const response = (await this.retriever(variables)) as Awaited<
      Promise<ReturnType<RetrieverFunc>>
    >

    const prevPage = page > 1 ? page * 1 - 1 : ''
    const nextPage = page < db.pages.length ? page * 1 + 1 : ''
    const currentPage = page
    const pageList = Array.from(Array(db.pages.length).keys()).map(
      (p) => p * 1 + 1
    )

    return {
      page: response,
      pageInfo: {
        prevPage,
        nextPage,
        currentPage,
        pageList,
      },
    }
  }
}
