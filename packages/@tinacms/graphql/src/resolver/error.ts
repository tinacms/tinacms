/**

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
      `Error parsing file ${args.file} from collection ${
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
