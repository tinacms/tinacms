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

export interface Store {
  glob(
    pattern: string,
    hydrator?: (fullPath: string) => Promise<object>
  ): Promise<string[]>
  get<T extends object>(filepath: string): Promise<T>
  // delete(filepath: string): Promise<void>
  clear(): void
  /**
   *
   * @param queryStrings
   * Queries are currently structured as prefixed keys where that last portion
   * of the key is the value provided by the query
   * ```graphql
   * {
   *   getPostsList(filter: {
   *     title: {
   *       eq: "Hello, World"
   *     }
   *   }) {
   *      ...
   *   }
   * }
   * ```
   * Would equate to a query string of:
   * ```
   * __attribute__#posts#posts#title#Hello, World
   * ```
   * This can be used by a data store as a secondary index of sorts
   *
   * It's important to note that for now each query string acts as an "AND" clause,
   * meaning the resulting records need to be present in _each_ query string.
   *
   * @param hydrator
   * hydrator is an optional callback, which may be useful depending on the storage mechanism.
   * For example, the in-memory storage only stores the path to its records as its value,
   * but in something like DynamoDB the query strings may be used to look up the full record,
   * meaning there's no need to "hydrate" the return value
   */
  query(
    queryStrings: string[],
    hydrator?: (fullPath: string) => Promise<object>
  ): Promise<object[]>

  /**
   * In this context, seeding is the act of putting records and indexing data into an ephemeral
   * storage layer for use during the GraphQL runtime. What might seem suprising is that some stores
   * don't support seeding, this is because they're behaving more like a "bridge" (GithubStore and FilesystemStore).
   * Currently they're acting as a way to swap out true data-layer behavior with a backwards-compatible
   * "store". In the future, all stores should be able to query and seed data.
   *
   * At this time it seems that it would never make sense to be able to "query" without "seed"-ing, and
   * there'd be no value in "seeding" without "query"-ing.
   */
  seed(
    filepath: string,
    data: object,
    options?: {
      includeTemplate?: boolean
    }
  ): Promise<void>
  supportsSeeding(): boolean
  /**
   * Whether this store supports the ability to index data.
   * Indexing data requires writing arbitrary keys/values to
   * the external service, so is not advisable to use for
   * something like Github, which would write commits to the
   * user's repo.
   */
  supportsIndexing(): boolean
  put(
    filepath: string,
    data: object,
    options?: {
      includeTemplate?: boolean
    }
  ): Promise<void>
}
