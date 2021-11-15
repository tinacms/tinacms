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

import {
  ASTNode,
  GraphQLError,
  GraphQLFormattedError,
  Source,
  SourceLocation,
} from 'graphql'

export class TinaError extends Error implements GraphQLError {
  public extensions: Record<string, any>
  // FIXME: not sure what this does
  // override readonly name!: string;
  readonly name!: string
  readonly locations: ReadonlyArray<SourceLocation> | undefined
  readonly path: ReadonlyArray<string | number> | undefined
  readonly source: Source | undefined
  readonly positions: ReadonlyArray<number> | undefined
  readonly nodes: ReadonlyArray<ASTNode> | undefined
  public originalError: Error | null | undefined;

  [key: string]: any

  constructor(message: string, extensions?: Record<string, any>) {
    super(message)

    // if no name provided, use the default. defineProperty ensures that it stays non-enumerable
    if (!this.name) {
      Object.defineProperty(this, 'name', { value: 'TinaError' })
    }

    this.extensions = { ...extensions }
  }
}
