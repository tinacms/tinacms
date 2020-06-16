/**

Copyright 2019 Forestry.io Inc

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

import {
  baseKeymap,
  chainCommands,
  createParagraphNear,
  liftEmptyBlock,
  splitBlock,
} from 'prosemirror-commands'
import { Schema } from 'prosemirror-model'

import { KeymapPlugin } from '../../types'
import { findPlugins } from '../../components/ProsemirrorEditor/utils/plugin'
import { KEYMAP_PLUGINS } from './keymap'

const mac =
  typeof navigator != 'undefined' ? /Mac/.test(navigator.platform) : false

export function buildKeymap(schema: Schema) {
  const keys: any = {
    ...baseKeymap,
  }

  function bind(key: string, cmd: any) {
    if (keys[key]) {
      cmd = chainCommands(cmd, keys[key])
    }
    keys[key] = cmd
  }

  bind('Enter', chainCommands(createParagraphNear, liftEmptyBlock, splitBlock))

  findPlugins<KeymapPlugin>('wysiwyg:keymap', KEYMAP_PLUGINS).forEach(
    plugin => {
      let skip = false

      // Exit early if this is a Mac, and it shouldn't be added for Mac.
      if (plugin.unlessMac && mac) skip = true

      // Exit early if it is for a mark type that doesn't exist.
      if (plugin.ifMark && !schema.marks[plugin.ifMark]) skip = true

      // Exit early if it is for a node type that doesn't exist.
      if (plugin.ifNode && !schema.nodes[plugin.ifNode]) skip = true
      if (plugin.ifNodes && !plugin.ifNodes.some(n => schema.nodes[n]))
        skip = true

      // Exit if condition not met
      if (plugin.onCondition && !plugin.onCondition(schema)) skip = true

      // Bind the command
      if (!skip) bind(plugin.name, plugin.command(schema))
    }
  )

  return keys
}
