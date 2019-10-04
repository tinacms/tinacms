import { Plugin } from '@tinacms/core'
import * as React from 'react'
import { Schema } from 'prosemirror-model'
import { SchemaNodePlugin, SchemaMarkPlugin } from './plugins'

export function useProsemirrorSchema(plugins: Plugin[]) {
  const schema = React.useMemo(() => {
    return new Schema({
      nodes: getNodes(plugins as any),
      marks: getMarks(plugins as any),
    })
  }, [plugins])

  return [schema]
}

function getNodes(plugins: SchemaNodePlugin[]) {
  const nodes: any = {}

  plugins
    .filter(plugin => plugin.__type === 'wysiwyg:schema:node')
    .forEach((plugin: SchemaNodePlugin) => {
      nodes[plugin.name] = plugin.node
    })

  return nodes
}

function getMarks(plugins: SchemaMarkPlugin[]) {
  const marks: any = {}

  plugins
    .filter(plugin => plugin.__type === 'wysiwyg:schema:mark')
    .forEach((plugin: SchemaMarkPlugin) => {
      marks[plugin.name] = plugin.mark
    })

  return marks
}
