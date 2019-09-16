import { Plugin } from '@tinacms/core'
import * as React from 'react'
import { Schema } from 'prosemirror-model'
import { SchemaNodePlugin, SchemaMarkPlugin } from './plugins'
import { NODES } from './schema/nodes'

export function useProsemirrorSchema(plugins: Plugin[]) {
  let schema = React.useMemo(() => {
    return new Schema({
      nodes: NODES as any,
      marks: getMarks(plugins as any),
    })
  }, [plugins])

  return [schema]
}

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
