import { Plugin } from '@tinacms/core'
import { Schema } from 'prosemirror-model'

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

export interface KeymapPlugin {
  __type: 'wysiwyg:keymap'
  name: string
  command(schema: Schema): any // TODO Command
  ifMark?: string
  ifNode?: string
  ifMac?: boolean
  unlessMac?: boolean
  onCondition?(schema: Schema): boolean
}

function byType<P extends Plugin>(__type: string) {
  return (plugin: Plugin) => plugin.__type === __type
}

export function findPlugins<P extends Plugin>(type: string, plugins: Plugin[]) {
  return plugins.filter(byType(type)) as P[]
}
