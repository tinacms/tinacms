import { Plugin } from '@tinacms/core'

export interface SchemaNodePlugin extends Plugin {
  __type: 'wysiwyg:schema:node'
  name: string
  node: any // TODO
}

export interface SchemaMarkPlugin extends Plugin {
  __type: 'wysiwyg:schema:mark'
  name: string
  mark: any // TODO
}
