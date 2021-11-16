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
