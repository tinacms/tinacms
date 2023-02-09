/**

*/

// This is an example of what the generated client COULD look like.

import {
  DocumentNode,
  OperationDefinitionNode,
  SelectionNode,
  print,
  ArgumentNode,
} from 'graphql'
function genArgs(params: { [key: string]: any }) {
  const keys = Object.keys(params)
  const args: ArgumentNode[] = keys.map((key) => {
    const name = key
    const value = params[key]
    return {
      kind: 'Argument',
      name: { kind: 'Name', value: name },
      value: { kind: 'StringValue', value: value },
    } as ArgumentNode
  })

  return args
}
export class TinaGQLClient {
  private _usedFrags = []
  private _frags: { [key: string]: SelectionNode } = {
    getAuthorDocument: {
      kind: 'Field',
      name: {
        kind: 'Name',
        value: 'getAuthorsDocument',
      },
      arguments: [],
      directives: [],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: {
              kind: 'Name',
              value: 'data',
            },
            arguments: [],
            directives: [],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'AuthorParts' },
                },
              ],
            },
          },
        ],
      },
    },
    gePostsDocument: {
      kind: 'Field',
      name: {
        kind: 'Name',
        value: 'getPostsDocument',
      },
      arguments: [],
      directives: [],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: {
              kind: 'Name',
              value: 'data',
            },
            arguments: [],
            directives: [],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'PostsParts' },
                },
              ],
            },
          },
        ],
      },
    },
  }

  private _selections: SelectionNode[] = []

  private get _queryAST(): OperationDefinitionNode {
    return {
      kind: 'OperationDefinition' as const,
      operation: 'query',
      selectionSet: {
        kind: 'SelectionSet' as const,
        selections: this._selections,
      },
    }
  }
  private get _DocumentAST(): DocumentNode {
    return {
      kind: 'Document' as const,
      definitions: [this._queryAST],
    }
  }
  public get query(): string {
    return print(this._DocumentAST)
  }

  /**
   * getAuthorDocument
   */
  public getAuthorDocument(args: { relativePath: string }) {
    const name = 'getAuthorDocument'
    this._usedFrags.push(name)
    const currentFrag = {
      ...this._frags[name],
      arguments: genArgs(args),
    }
    this._selections.push(currentFrag)
    return this
  }

  public gePostsDocument(args: { relativePath: string }) {
    this._usedFrags.push('gePostsDocument')
    const currentFrag = {
      ...this._frags['gePostsDocument'],
      arguments: genArgs(args),
    }
    this._selections.push(currentFrag)
    return this
  }
}
