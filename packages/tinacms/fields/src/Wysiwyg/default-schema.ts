import { Schema } from 'prosemirror-model'
import { SchemaNodePlugin, SchemaMarkPlugin } from './plugins'
import { MARK_PLUGINS, NODE_PLUGINS } from './default-plugins'

// TODO: Move to prosemirror test utils?

export const defaultSchema = new Schema({
  nodes: getNodes(NODE_PLUGINS),
  marks: getMarks(MARK_PLUGINS),
} as any)

function getNodes(plugins: SchemaNodePlugin[]) {
  let nodes: any = {}

  plugins
    .filter(plugin => plugin.__type === 'wysiwyg:schema:node')
    .forEach((plugin: SchemaNodePlugin) => {
      nodes[plugin.name] = plugin.node
    })

  return nodes
}

function getMarks(plugins: SchemaMarkPlugin[]) {
  let nodes: any = {}

  plugins
    .filter(plugin => plugin.__type === 'wysiwyg:schema:mark')
    .forEach((plugin: SchemaMarkPlugin) => {
      nodes[plugin.name] = plugin.mark
    })

  return nodes
}
