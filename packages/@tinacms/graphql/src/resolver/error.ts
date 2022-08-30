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

import { ASTNode, GraphQLError, Source, SourceLocation } from 'graphql'

export class TinaGraphQLError extends Error implements GraphQLError {
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
      Object.defineProperty(this, 'name', { value: 'TinaGraphQLError' })
    }

    this.extensions = { ...extensions }
  }
}

export type TypeFetchErrorArgs = {
  stack?: string
  file?: string
  includeAuditMessage?: boolean
  originalError: Error
  collection?: string
}

export class TinaFetchError extends Error {
  public stack?: string
  public collection?: string
  public file?: string
  originalError: Error
  constructor(message: string, args: TypeFetchErrorArgs) {
    super(message)
    this.name = 'TinaFetchError'
    this.collection = args.collection
    this.stack = args.stack
    this.file = args.file
    this.originalError = args.originalError
  }
}
export class TinaQueryError extends TinaFetchError {
  public stack?: string
  public collection?: string
  public file?: string
  originalError: Error
  constructor(args: TypeFetchErrorArgs) {
    super(
      `Error querying file ${args.file} from collection ${
        args.collection
      }. ${auditMessage(args.includeAuditMessage)}`,
      args
    )
  }
}

export class TinaParseDocumentError extends TinaFetchError {
  public stack?: string
  public collection?: string
  public file?: string
  originalError: Error
  constructor(args: TypeFetchErrorArgs) {
    super(
      `Error Parsing file ${args.file} from collection ${
        args.collection
      }. ${auditMessage(args.includeAuditMessage)}`,
      args
    )
  }
  toString() {
    return (
      super.toString() + '\n OriginalError: \n' + this.originalError.toString()
    )
  }
}

const auditMessage = (includeAuditMessage: boolean = true) =>
  includeAuditMessage
    ? `Please run "tinacms audit" or add the --verbose option  for more info`
    : ''

export const handleFetchErrorError = (e: unknown, verbose) => {
  if (e instanceof Error) {
    if (e instanceof TinaFetchError) {
      if (verbose) {
        console.log(e.toString())
        console.log(e)
        console.log(e.stack)
      }
    }
  } else {
    console.error(e)
  }
  throw e
}
