import {
  baseKeymap,
  chainCommands,
  createParagraphNear,
  liftEmptyBlock,
  splitBlock,
} from 'prosemirror-commands'
import { Schema } from 'prosemirror-model'
import { findPlugins, KeymapPlugin } from '../plugins'
import { Plugin } from '@tinacms/core'

const mac =
  typeof navigator != 'undefined' ? /Mac/.test(navigator.platform) : false

export function buildKeymap(schema: Schema, plugins: Plugin[]) {
  let keys: any = {
    ...baseKeymap,
  }

  function bind(key: string, cmd: any) {
    if (keys[key]) {
      cmd = chainCommands(cmd, keys[key])
    }
    keys[key] = cmd
  }

  findPlugins<KeymapPlugin>('wysiwyg:keymap', plugins).forEach(plugin => {
    let skip = false

    // Exit early if this is a Mac, and it shouldn't be added for Mac.
    if (plugin.unlessMac && mac) skip = true

    // Exit early if it is for a mark type that doesn't exist.
    if (plugin.ifMark && !schema.marks[plugin.ifMark]) skip = true

    // Exit early if it is for a node type that doesn't exist.
    if (plugin.ifNode && !schema.nodes[plugin.ifNode]) skip = true

    // Exit if condition not met
    if (plugin.onCondition && !plugin.onCondition(schema)) skip = true

    // Bind the command
    if (!skip) bind(plugin.name, plugin.command(schema))
  })

  bind('Enter', chainCommands(createParagraphNear, liftEmptyBlock, splitBlock))

  return keys
}
